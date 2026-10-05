# Repository Description Draft

Use these texts when creating the GitHub (or similar) repository.
No real hostnames or private IPs — dummy values only.

---

## Short description (GitHub “About”)

> K6 load test suite: baseline, stress, spike, soak, extreme-plateau. Shared config, thresholds, docs, CI-friendly. Authorized testing only.

**Topics / tags**

```
k6
load-testing
performance-testing
grafana-k6
linux
docker
stress-test
soak-test
capacity-planning
javascript
```

---

## Long description (repo home / README intro)

```markdown
# K6 Load Testing Suite

Production-ready [k6](https://k6.io/) performance testing suite for authorized environments only.

Runs on **Linux**, **Windows**, and **macOS** (bash/sh by default; PowerShell noted where it differs).

## What's inside

- **8 test scripts** — smoke, baseline, stress (breaking point), spike, soak, realistic ramping, chaos hybrid, and a **flat extreme-plateau** test with zero VU fluctuation
- **Shared core** — centralized thresholds, headers, think-time, TLS policy, and reusable helpers
- **Adjustable extreme loads** — `TARGET_VUS`, `EXTREME_DURATION`, `RAMP_IN` via environment variables
- **CI-friendly** — non-zero exit when thresholds fail; JSON/cloud output supported; Docker image for Linux CI
- **Docs + diagrams** — Mermaid architecture, decision tree, and load-profile charts

## Quick start

```bash
cp .env.example .env   # set BASE_URL to your authorized target
k6 run tests/load-test.js
```

Linux install examples: apt (Debian/Ubuntu), dnf (Fedora/RHEL), snap, AUR, or Docker (`grafana/k6`).

## ⚠️ Authorized use only

Test only systems you own or have explicit written permission to test.
Unauthorized load generation or access is illegal. See the Disclaimer in the README.
```

---

## About blurb (1–2 sentences, for website fields)

> A modular k6 load-testing toolkit with baseline, stress, spike, soak, and steady extreme-plateau scenarios — built for capacity planning and authorized performance validation.

---

## Badges to place at the top of the README

```markdown
![Suite](https://img.shields.io/badge/suite-v2.1.0-4c956c)
![k6](https://img.shields.io/badge/k6-load%20testing-369661?logo=grafana&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana%20k6-compatible-F46800?logo=grafana&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-333)
![Use](https://img.shields.io/badge/use-authorized%20only-CB0000)
```

---

## Technologies covered by badges

| Technology | Badge role |
| --- | --- |
| k6 / Grafana k6 | Primary load-testing engine |
| JavaScript (ES2020) | Test script language |
| Docker | Optional runner (`grafana/k6` image) — typical on Linux CI |
| Linux | Primary for CI, servers, high VU counts |
| Windows | Development; Chocolatey / winget / PowerShell |
| macOS | Development; Homebrew |
| Authorized-use notice | Compliance reminder |

### Topics (GitHub tags)

```
k6
load-testing
performance-testing
grafana-k6
linux
docker
stress-test
soak-test
capacity-planning
javascript
```

---

## Checklist before publishing

- [ ] Replace example `BASE_URL` values in `.env` with your authorized target (`.env` is gitignored)
- [ ] Confirm no private IPs or internal hostnames remain in tracked files
- [ ] Keep the Disclaimer section in `README.md`
- [ ] Set repository visibility intentionally (private recommended until reviewed)
- [ ] Pin badge version to match `VERSION` file
