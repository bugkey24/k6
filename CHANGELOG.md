# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-10-05

### Added

- `tests/extreme-plateau-test.js` — holds extreme load steady with **no VU fluctuation**; adjustable via `TARGET_VUS` (default `300`), `EXTREME_DURATION` (default `10m`), `RAMP_IN` (default `0s` = pure `constant-vus`)
- `extreme` threshold profile in `src/config.js`: `p(95)<3000ms`, `p(99)<5000ms`, `http_req_failed rate<0.05`
- `getScenarioOptions()` helper in `src/config.js` for scenario-based k6 options (e.g. `constant-vus`)
- TLS skip-verification support: `insecureSkipTLSVerify` emitted by `getDefaultOptions()` / `getScenarioOptions()`, controlled by `SKIP_TLS_VERIFY` (default `true`)
- Versioning: root `VERSION` file and `VERSION` export in `src/config.js`
- Documentation: `docs/TESTS.md`, `docs/CONFIGURATION.md`, `docs/QUICK_REFERENCE.md`, `docs/REPOSITORY.md`; README and `docs/INSTALL.md` rewritten to match the actual suite
- Cross-platform docs: Linux (apt/dnf/snap/AUR/Docker), Windows (choco/winget/PowerShell), and macOS (Homebrew) covered with equal detail

### Changed

- `.env.example` now documents `TARGET_VUS`, `EXTREME_DURATION`, `RAMP_IN`, and `SKIP_TLS_VERIFY`
- README / INSTALL reference the real 8-script layout under `tests/` (no phantom legacy paths)

### Fixed

- TLS failures against IP-based HTTPS targets (e.g. `https://target.example.com/` / `https://192.0.2.10/`) when the certificate has no IP SANs — `x509: cannot validate certificate ... doesn't contain any IP SANs`; all scripts skip TLS verification by default. Enforce strict TLS with `--env SKIP_TLS_VERIFY=false`

## [2.0.0] - 2026-09-14

### Added

- Refactored k6 suite with shared modules: `src/config.js` (URLs, headers, thresholds, patterns), `src/helpers.js` (requests, verification, think time, logging), `src/scenarios.js` (reusable scenario objects)
- Test scripts under `tests/`:
  - `api-test.js` — smoke/health check
  - `load-test.js` — baseline load (20 VUs, ~2m)
  - `stress-test.js` — progressive breaking point (50→400 VUs, ~5m)
  - `spike-test.js` — sudden burst (500 VUs, ~1.5m)
  - `soak-test.js` — long-term stability (100 VUs, ~34m)
  - `ramping-test.js` — realistic multi-stage traffic (~4m)
  - `stress-spike-test.js` — combined extreme + spike (up to 5000 VUs, ~7.5m)
- Threshold profiles for `load`, `stress`, `spike`, `soak`
- Environment-variable configuration via `--env` / `--env-file=.env`
