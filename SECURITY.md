# Security posture

## Publishing

- **Trusted Publishing (OIDC) only.** The package is published exclusively from
  the `release.yml` GitHub Actions workflow, scoped to the `release`
  environment, using a short-lived OIDC-minted credential. There is no
  long-lived npm token anywhere in this repository, its secrets, or its CI env.
- **Provenance.** Every release is published with `--provenance`, producing a
  signed build attestation linking the tarball to this repo, commit, and
  workflow run.
- **Token publishing disabled.** The package is configured on npmjs.com to
  require 2FA and disallow classic tokens. Account MFA is enabled.
- **Tag-gated.** Releases trigger only on pushed `v*` tags, never on pushes to
  `main`.

## Dependencies

- **Zero runtime dependencies**, zero dev dependencies.
- **No lifecycle scripts** (`preinstall` / `postinstall` / etc.).
- Installs are locked: `package-lock.json` is committed and CI uses `npm ci`.
- Lockfile/pinning hygiene enforced by **locked-in** in CI.
- Supply-chain scanning via **Socket** in CI.

## CI/CD hardening

- All workflows default to `permissions: {}`; jobs request the minimum needed.
- Every third-party action is pinned to a full commit SHA (version in a
  comment); floating tags are not used.
- `actions/checkout` runs with `persist-credentials: false`.
- **zizmor** lints all workflows at `min-severity: medium` on every push/PR.
- Pinned SHAs are kept current by Dependabot.

## Reporting a vulnerability

This is a demonstration package. For a real package, add a contact here (e.g. a
security email or a GitHub private vulnerability reporting link) and enable
**Settings → Security → Private vulnerability reporting** on the repository.
