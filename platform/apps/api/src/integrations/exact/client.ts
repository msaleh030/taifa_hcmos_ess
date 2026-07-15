import { withTenant } from "@hcmos/db";
import type { ExactAdapter, PayrollJournal } from "./adapter.js";
import { loadEnv } from "../../env.js";

/**
 * Stub adapter — used automatically when no Exact credentials are configured.
 * It persists a "connection" flag and logs journals instead of calling Exact,
 * so the whole payroll → GL hand-off is exercisable end-to-end in dev and CI.
 */
class StubExactAdapter implements ExactAdapter {
  readonly mode = "stub" as const;

  async isConnected(tenantId: string): Promise<boolean> {
    const conn = await withTenant(tenantId, (tx) => tx.exactConnection.findUnique({ where: { tenantId } }));
    return Boolean(conn?.division);
  }

  authorizationUrl(_tenantId: string, state: string): string {
    return `about:blank#stub-exact-consent&state=${encodeURIComponent(state)}`;
  }

  async handleCallback(tenantId: string, code: string): Promise<void> {
    await withTenant(tenantId, (tx) =>
      tx.exactConnection.upsert({
        where: { tenantId },
        update: { division: `stub-${code.slice(0, 6)}`, accessToken: "stub", refreshToken: "stub" },
        create: { tenantId, division: `stub-${code.slice(0, 6)}`, accessToken: "stub", refreshToken: "stub" },
      }),
    );
  }

  async postPayrollJournal(_tenantId: string, journal: PayrollJournal): Promise<{ remoteId: string }> {
    // eslint-disable-next-line no-console
    console.info(`[exact:stub] would post ${journal.lines.length}-line journal for ${journal.period}`);
    return { remoteId: `stub-${journal.reference}` };
  }
}

/**
 * Live Exact Online adapter (OAuth2 + REST). This is a working skeleton: the
 * token exchange and journal POST are real HTTP calls, but the exact endpoint
 * paths and GL-account mapping MUST be validated against the tenant's Exact
 * division before go-live. Tokens are stored per-tenant in exact_connection.
 */
class LiveExactAdapter implements ExactAdapter {
  readonly mode = "live" as const;

  async isConnected(tenantId: string): Promise<boolean> {
    const conn = await withTenant(tenantId, (tx) => tx.exactConnection.findUnique({ where: { tenantId } }));
    return Boolean(conn?.accessToken && conn?.division);
  }

  authorizationUrl(_tenantId: string, state: string): string {
    const env = loadEnv();
    const p = new URLSearchParams({
      client_id: env.EXACT_CLIENT_ID,
      redirect_uri: env.EXACT_REDIRECT_URI,
      response_type: "code",
      force_login: "0",
      state,
    });
    return `${env.EXACT_BASE_URL}/api/oauth2/auth?${p.toString()}`;
  }

  async handleCallback(tenantId: string, code: string): Promise<void> {
    const env = loadEnv();
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.EXACT_CLIENT_ID,
      client_secret: env.EXACT_CLIENT_SECRET,
      redirect_uri: env.EXACT_REDIRECT_URI,
      code,
    });
    const res = await fetch(`${env.EXACT_BASE_URL}/api/oauth2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(`Exact token exchange failed: ${res.status}`);
    const tok = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
    await withTenant(tenantId, (tx) =>
      tx.exactConnection.upsert({
        where: { tenantId },
        update: {
          accessToken: tok.access_token,
          refreshToken: tok.refresh_token,
          expiresAt: new Date(Date.now() + tok.expires_in * 1000),
          division: env.EXACT_DIVISION || null,
        },
        create: {
          tenantId,
          accessToken: tok.access_token,
          refreshToken: tok.refresh_token,
          expiresAt: new Date(Date.now() + tok.expires_in * 1000),
          division: env.EXACT_DIVISION || null,
        },
      }),
    );
  }

  /**
   * Ensure a non-expired access token, refreshing via the refresh_token grant
   * when it is within 60s of expiry. Persists the rotated tokens. Returns the
   * usable access token + division, or throws if the tenant is not connected.
   */
  private async ensureToken(tenantId: string): Promise<{ accessToken: string; division: string }> {
    const env = loadEnv();
    const conn = await withTenant(tenantId, (tx) => tx.exactConnection.findUnique({ where: { tenantId } }));
    if (!conn?.accessToken || !conn.refreshToken || !conn.division) {
      throw new Error("Exact not connected for tenant");
    }
    const fresh = conn.expiresAt && conn.expiresAt.getTime() - Date.now() > 60_000;
    if (fresh) return { accessToken: conn.accessToken, division: conn.division };

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.EXACT_CLIENT_ID,
      client_secret: env.EXACT_CLIENT_SECRET,
      refresh_token: conn.refreshToken,
    });
    const res = await fetch(`${env.EXACT_BASE_URL}/api/oauth2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) throw new Error(`Exact token refresh failed: ${res.status}`);
    const tok = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
    await withTenant(tenantId, (tx) =>
      tx.exactConnection.update({
        where: { tenantId },
        data: {
          accessToken: tok.access_token,
          refreshToken: tok.refresh_token,
          expiresAt: new Date(Date.now() + tok.expires_in * 1000),
        },
      }),
    );
    return { accessToken: tok.access_token, division: conn.division };
  }

  async postPayrollJournal(tenantId: string, journal: PayrollJournal): Promise<{ remoteId: string }> {
    const env = loadEnv();
    const { accessToken, division } = await this.ensureToken(tenantId);
    // NOTE: endpoint + payload shape are indicative; validate against Exact docs.
    const res = await fetch(
      `${env.EXACT_BASE_URL}/api/v1/${division}/generaljournalentry/GeneralJournalEntries`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          Reference: journal.reference,
          Description: `HCMOS payroll ${journal.period}`,
          GeneralJournalEntryLines: journal.lines.map((l) => ({
            GLAccountCode: l.glAccount,
            Description: l.description,
            AmountFC: l.amount,
          })),
        }),
      },
    );
    if (!res.ok) throw new Error(`Exact journal post failed: ${res.status}`);
    const json = (await res.json()) as { d?: { ID?: string } };
    return { remoteId: json.d?.ID ?? journal.reference };
  }
}

let _adapter: ExactAdapter | undefined;

/** Returns the live adapter when credentials are present, else the stub. */
export function getExactAdapter(): ExactAdapter {
  if (_adapter) return _adapter;
  const env = loadEnv();
  _adapter = env.EXACT_CLIENT_ID && env.EXACT_CLIENT_SECRET ? new LiveExactAdapter() : new StubExactAdapter();
  return _adapter;
}
