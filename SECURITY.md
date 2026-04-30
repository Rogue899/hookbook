# Security Policy

## Reporting a vulnerability

If you discover a security issue in hookbook.dev — for example, a recipe that ships an unsafe shell command, a hook that exfiltrates secrets, or anything that could mislead users into running insecure code — please email **t.arek.r94@gmail.com** with the subject line `[hookbook security]`.

Do **not** open a public issue for security reports. Expect a response within 72 hours.

## Scope

- Recipes that ship dangerous shell patterns (rm -rf, unguarded eval, etc.)
- Misleading trust labels or attribution
- Site-level vulnerabilities (XSS, etc.) — note this is a static site so the surface is small
- Dependencies in `package.json` with known CVEs

Recipes that are *theoretical* or *experimental* by their trust label are documented as such and are not security bugs.
