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
          {!mfaToken ? (
            <form onSubmit={submitPassword}>
              <h1 className="login-h">Sign in</h1>
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
