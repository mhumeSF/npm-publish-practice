# Manual setup checklist

These are the one-time steps that **you** must do in the npm and GitHub web UIs —
they can't be scripted, and they're what make the pipeline secure. Do them in
order. Steps that must happen **before the first release** are marked ⚠️.

Placeholders used below (replace with your real values — see the repo root
"Placeholders" note if any remain in files):

- `mhumesf` — your npm username / scope
- `mhumeSF` — your personal GitHub username
- `npm-publish-practice` — this repository's name on GitHub

---

## 1. Push the repo to GitHub

```bash
git remote add origin git@github.com:mhumeSF/npm-publish-practice.git
git push -u origin main
```

## 2. ⚠️ Enable MFA on your npm account

npmjs.com → your avatar → **Account** → **Two-Factor Authentication** →
enable **authenticator app** (TOTP). Choose the level that requires 2FA for
**authorization and writes**.

## 3. ⚠️ Create the `release` GitHub environment

GitHub repo → **Settings** → **Environments** → **New environment** → name it
exactly **`release`**.

- (Recommended) Under **Deployment branches and tags**, restrict deployments to
  the tag pattern `v*` so the environment (and thus the OIDC claim) is only ever
  used from version tags.
- (Optional) Add yourself as a **required reviewer** so each publish needs a
  manual approval click.

## 4. ⚠️ Publish once to create the package name, OR pre-register the trusted publisher

npm's trusted-publisher config attaches to a package. You have two options:

**Option A — pre-configure (preferred, no token ever):** Some npm accounts can
register a trusted publisher for a not-yet-published package. If your account
supports it, do step 5 now, then release via CI.

**Option B — bootstrap publish:** If npm requires the package to exist first, do
a single manual publish of `0.0.0` (or `0.1.0`) locally with 2FA, then
immediately configure the trusted publisher (step 5) and disable tokens
(step 6). After that, all publishing is via CI/OIDC.

## 5. ⚠️ Configure the trusted publisher on npmjs.com

npmjs.com → the package (`@mhumesf/npm-publish-practice`) → **Settings** →
**Trusted Publisher** → **GitHub Actions**, then fill in **exactly**:

| Field | Value |
|---|---|
| Organization or user | `mhumeSF` |
| Repository | `npm-publish-practice` |
| Workflow filename | `release.yml` |
| Environment name | `release` |
| Allowed actions | `npm publish` |

The workflow filename is the basename only (`release.yml`, not a path), and it
must match `.github/workflows/release.yml`. The environment must match step 3.

## 6. ⚠️ Disable token publishing / require 2FA on the package

This is what closes the door on stolen tokens. npmjs.com → the package →
**Settings** → **Publishing access** → select
**"Require two-factor authentication and disallow tokens"** → **Update Package
Settings**.

Trusted-publisher (OIDC) publishing keeps working; classic automation tokens no
longer can.

## 7. Turn on branch protection for `main`

GitHub repo → **Settings** → **Branches** → **Add branch ruleset** (or classic
branch protection) for `main`:

- ✅ Require a pull request before merging.
- ✅ Require status checks to pass. Add as required checks:
  - `test` (or the per-version matrix checks)
  - `lint`
  - `locked-in`
  - `zizmor`
  - `socket`
- ✅ Require branches to be up to date before merging.
- ✅ Block force pushes.
- ✅ Restrict deletions.

(The check names appear in the list after the workflows have run at least once.)

## 8. (Optional) Install the Socket GitHub App

For PR-level supply-chain analysis beyond the free firewall step: https://github.com/apps/socket-security
→ install on `mhumeSF/npm-publish-practice`. Requires a free Socket account. The
`socket.yml` firewall step works without this.

---

## First release

Once steps 1–6 are done:

```bash
npm version patch        # or: npm version 0.1.0
git push --follow-tags
```

Watch the **Release** workflow. On success, verify on npmjs.com that the
package page shows a **provenance** badge / "Built and signed on GitHub Actions".

## Verifying provenance later

```bash
npm audit signatures
# or inspect a specific version:
npm view @mhumesf/npm-publish-practice --json | grep -i provenance
```
