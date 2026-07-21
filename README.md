# @mhumesf/npm-publish-practice

A one-function `hello()` package. The code is deliberately trivial — the point of
this repo is the **hardened, best-practice npm publishing pipeline** around it.

```js
const { hello } = require('@mhumesf/npm-publish-practice');

hello();        // "Hello, world!"
hello('Ada');   // "Hello, Ada!"
```

- Zero runtime dependencies. Zero dev dependencies.
- No lifecycle scripts (`postinstall` etc.).
- Ships only `index.js` (plus `README`, `LICENSE`, `package.json`).
- `engines.node >= 20`.

## How the secure publishing pipeline works

This is the interesting part. Every credential-bearing path is designed so that
there is **no long-lived secret to steal**.

### Trusted Publishing via GitHub OIDC — no tokens, ever

Publishing happens **only** from [`.github/workflows/release.yml`](.github/workflows/release.yml),
and **only** when a `v*` git tag is pushed. That job:

1. Checks out the code with `persist-credentials: false`.
2. Runs `npm ci`, tests, and a syntax lint.
3. Publishes with `npm publish --provenance --access public`.

The job requests `id-token: write`. npm (≥ 11.5.1) detects the GitHub OIDC
environment, exchanges the OIDC token for a **short-lived (~15 min) publish
credential**, and generates a **provenance attestation** binding the published
tarball to this repo, commit, and workflow run. There is:

- **No `NPM_TOKEN` secret.**
- **No `.npmrc` with auth.**
- **No `npm login`.**

The OIDC claim is scoped to a GitHub **environment** named `release`, which you
configure as the trusted publisher on npmjs.com (see [SETUP.md](SETUP.md)).

### Locked, reproducible installs

- `package-lock.json` is committed. CI installs with **`npm ci`**, never
  `npm install`.
- [**locked-in**](https://github.com/asymmetric-research/locked-in) runs in CI
  (installed from a pinned commit) to enforce lockfile usage and version
  pinning across scripts, Dockerfiles, and workflows.

### GitHub Actions hardening (zizmor)

[**zizmor**](https://github.com/zizmorcore/zizmor) lints every workflow at
`min-severity: medium`. Accordingly, all workflows:

- Default to `permissions: {}` and grant minimal per-job permissions.
- **Pin every action to a full commit SHA** with a version comment.
- Use `persist-credentials: false` on checkout.

### Supply-chain scanning (Socket)

[**Socket**](https://socket.dev) runs in free firewall mode (`sfw npm ci`),
requiring no account. Optionally install the Socket GitHub App for PR-level
analysis (see [SETUP.md](SETUP.md)).

### Keeping pins fresh

[Dependabot](.github/dependabot.yml) watches the `github-actions` and `npm`
ecosystems and opens PRs that bump the pinned SHAs (and their version comments).

## Workflows at a glance

| Workflow | Trigger | Does |
|---|---|---|
| `ci.yml` | push / PR to `main` | test matrix (Node 20/22/24), syntax lint, locked-in |
| `zizmor.yml` | push / PR to `main` | workflow security lint |
| `socket.yml` | push / PR to `main` | supply-chain firewall scan |
| `release.yml` | push tag `v*` | OIDC trusted publish + provenance |

## Releasing

Publishing is fully automated but human-triggered:

```bash
npm version patch        # bumps package.json + creates a git tag
git push --follow-tags   # pushes main + the tag -> triggers release.yml
```

The `release` environment's trusted-publisher config on npmjs.com must be in
place first. See **[SETUP.md](SETUP.md)** for the one-time manual steps.

## Manual setup checklist

The npm-account and GitHub-UI steps that can't be scripted live in
**[SETUP.md](SETUP.md)**. The security posture is summarized in
**[SECURITY.md](SECURITY.md)**.

## License

MIT © mhumesf
