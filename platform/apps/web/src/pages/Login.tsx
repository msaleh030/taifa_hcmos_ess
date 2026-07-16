import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../lib/api.js";
import { useAuth } from "../lib/auth.js";

export function LoginPage() {
  const { setSession, user } = useAuth();
  const navigate = useNavigate();
  const [tenantSlug, setTenantSlug] = useState("taifa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (user) {
    navigate("/", { replace: true });
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await api.login(tenantSlug, email, password);
      if (res.status === "mfa_required") {
        setMfaToken(res.mfaToken);
      } else if (res.status === "mfa_setup_required") {
        // Privileged role without MFA — enroll now using the restricted token.
        const enroll = await api.mfaEnroll(res.setupToken);
        setSetupToken(res.setupToken);
        setSetupSecret(enroll.secret);
      } else {
        setSession(res.accessToken, res.refreshToken, res.user);
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitSetup(e: FormEvent) {
    e.preventDefault();
    if (!setupToken) return;
    setError(null);
    setBusy(true);
    try {
      await api.mfaEnrollVerify(setupToken, code);
      // Enrolled — the next sign-in will require the authenticator code.
      setSetupToken(null);
      setSetupSecret(null);
      setMfaToken(null);
      setCode("");
      setPassword("");
      setNotice("MFA enabled. Sign in again with your password, then your authenticator code.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Enrollment failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitMfa(e: FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setError(null);
    setBusy(true);
    try {
      const res = await api.mfaVerify(mfaToken, code);
      setSession(res.accessToken, res.refreshToken, res.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-split">
      <div className="login-canvas">
        <div className="login-brand">
          HCMOS<sup>™</sup>
        </div>
        <p className="login-tag">Taifa Human Capital Management Operating System</p>
      </div>
      <div className="login-panel">
        <div className="card login-card">
          {setupToken ? (
            <form onSubmit={submitSetup}>
              <h1 className="login-h">Set up two-factor</h1>
              <p className="login-sub">
                Your role requires MFA. Add this secret to your authenticator app, then enter the 6-digit code.
              </p>
              <div className="mfa-secret num" aria-label="MFA secret">
                {setupSecret}
              </div>
              <label className="field">
                <span>Code</span>
                <input
                  className="input num"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </label>
              {error && <div className="form-err">{error}</div>}
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
                {busy ? "Enabling…" : "Enable MFA"}
              </button>
            </form>
          ) : !mfaToken ? (
            <form onSubmit={submitPassword}>
              <h1 className="login-h">Sign in</h1>
              {notice && <div className="form-note">{notice}</div>}
              <label className="field">
                <span>Tenant</span>
                <input className="input" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
              </label>
              <label className="field">
                <span>Email</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </label>
              <label className="field">
                <span>Password</span>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              {error && <div className="form-err">{error}</div>}
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
                {busy ? "Signing in…" : "Continue"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitMfa}>
              <h1 className="login-h">Two-factor</h1>
              <p className="login-sub">Enter the 6-digit code from your authenticator app.</p>
              <label className="field">
                <span>Code</span>
                <input
                  className="input num"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                />
              </label>
              {error && <div className="form-err">{error}</div>}
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
                {busy ? "Verifying…" : "Verify"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
