# Security fixes — problem → fix

## Before you deploy (read this)
1. **`JWT_SECRET` and `ENCRYPTION_KEY` must be set on Railway** (64 random hex chars each). The app now refuses to start on a public deployment without them. Do **not** change `ENCRYPTION_KEY` if it is already set — it decrypts the stored WhatsApp tokens.
2. **Each school needs its Meta App Secret** (Settings → WhatsApp), or the global `META_APP_SECRET` for Embedded Signup. Webhooks without a secret are now rejected instead of accepted.
3. Set `TRUST_PROXY=1` on Railway so lockouts and the audit log see real client IPs.
4. Sign in as the platform owner, delete or rotate demo/test schools that use the well-known `Demo@12345` password, and set a new platform-owner password.
5. Backups on Railway's own disk disappear on redeploy — set `BACKUP_S3_BUCKET` or attach a volume.
6. Platform admins: turn on 2FA (Platform → My security).

## Fixes
| # | Problem | Fix |
|---|---|---|
| 1 | One school's webhook URL could be used to write into another school (payload named the other school's number) | Each school's URL is pinned to its own phone number / page; mismatches are dropped and logged |
| 2 | Webhooks with no App Secret were accepted unsigned | Fail closed: unsigned or wrongly signed → 401 |
| 3 | A lead/task could be assigned to a user id from another school | All ids from the browser are checked against the school |
| 4 | Counsellors restricted to their own leads could still run broadcasts to everyone | Broadcast audience/create/send/retry are admin-only for restricted counsellors |
| 5 | Uploaded `.html`/`.svg` files were served from our domain (stored XSS, token theft) | Type allow-list, server-chosen extension, fixed content-type, `nosniff`, sandbox CSP, forced download for non-media |
| 6 | Dev default JWT/encryption secrets could run in production | Refuses to boot; warns on short secrets |
| 7 | Tokens in URLs (`?token=`) worked everywhere, ending up in logs | Only the live-update stream accepts it; JWT algorithm pinned to HS256 |
| 8 | Role/tenant trusted from the token; no way to end a stolen session | Role re-read from the DB each request; `token_version` revocation; password change, deactivation, role change and "Sign out everywhere" end sessions at once |
| 9 | Weak passwords (8 chars), no lockout | 10+ chars with letters + numbers, common/e-mail-name check; lockout per e-mail and per IP; timing-equalised unknown-user path; bcrypt cost 12 |
| 10 | No second factor | TOTP 2FA (any authenticator app), encrypted secret, replay protection, one-time recovery codes |
| 11 | Master-admin "impersonate" was invisible to the school, 4 h, unlimited | Reason required, 2 h, optional read-only, school can switch it off, every start/change logged and visible to the school; cannot change passwords or 2FA |
| 12 | Shared well-known demo password on any server | Random password in production |
| 13 | Open redirect on website-form webhook; timing-unsafe key compares; unbounded `webhook_log` | Redirect only back to the form's own site; constant-time compares; size-capped, pruned after 30 days |
| 14 | CSP allowed all inline scripts; no HSTS | Hash-only CSP (+`object-src 'none'`, `base-uri`), HSTS, Permissions-Policy, COOP/CORP |
| 15 | No rate limits | Per-IP on login/webhooks/cron, per-user on API and AI |
| 16 | Lead AI was rules only | `AI_PROVIDER=rules|ollama|huggingface|anthropic`: free open-source models read replies (phone/e-mail masked, cached, per-school off switch, rules fallback) |

## Not done (phase 2)
- PostgreSQL row-level security as a second isolation layer.
- Encrypting backup files; QR code for 2FA set-up (setup key is shown instead).
- The Hugging Face / Ollama code paths are tested against local fake servers only — try them once with your real token / model.
- Razorpay Checkout and the Facebook SDK were tested under the stricter CSP with stubs only — do one real checkout and one Embedded Signup after deploying.
