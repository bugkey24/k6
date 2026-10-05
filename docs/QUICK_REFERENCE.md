# Quick Reference

**Suite version**: 2.1.0

![k6](https://img.shields.io/badge/k6-load%20testing-369661?logo=grafana&logoColor=white)
![Use](https://img.shields.io/badge/use-authorized%20only-CB0000)

> ⚠️ **Authorized use only** — see [README disclaimer](../README.md#disclaimer--authorized-use-only).

---

## Run a test

Commands use **bash/sh** (Linux, macOS, Windows Git Bash / WSL).  
On **Windows PowerShell**, the same `k6 run ... --env ...` syntax works.

```bash
k6 run --env-file=.env <script>
k6 run <script> --env BASE_URL=https://app.example.com/ --env TIMEOUT=60s
```

| Goal | Command |
| --- | --- |
| Smoke / up? | `k6 run tests/api-test.js` |
| Baseline | `k6 run tests/load-test.js` |
| Breaking point | `k6 run tests/stress-test.js` |
| Sudden burst | `k6 run tests/spike-test.js` |
| Long-term stability | `k6 run tests/soak-test.js` |
| Realistic traffic | `k6 run tests/ramping-test.js` |
| Chaos hybrid | `k6 run tests/stress-spike-test.js` |
| Flat extreme load | `k6 run tests/extreme-plateau-test.js --env TARGET_VUS=300 --env EXTREME_DURATION=10m` |

---

## Recommended sequence

```bash
k6 run tests/api-test.js
k6 run tests/load-test.js
k6 run tests/stress-test.js
k6 run tests/extreme-plateau-test.js --env TARGET_VUS=<limit> --env EXTREME_DURATION=10m
k6 run tests/soak-test.js
```

---

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `http://localhost:3000` | Target URL |
| `TIMEOUT` | `30s` | Request timeout |
| `THINK_TIME_MIN` / `THINK_TIME_MAX` | `1` / `3` | Think time range (s) |
| `SKIP_TLS_VERIFY` | `true` | Skip TLS verification (IP/self-signed) |
| `TARGET_VUS` | `300` | Extreme plateau VUs |
| `EXTREME_DURATION` | `10m` | Extreme plateau duration |
| `RAMP_IN` | `0s` | Extreme plateau ramp-in (`0` = `constant-vus`) |

```bash
# Linux / macOS — shell env
export BASE_URL=https://app.example.com/
k6 run tests/load-test.js
```

```powershell
# Windows PowerShell — shell env
$env:BASE_URL = "https://app.example.com/"
k6 run tests/load-test.js
```

All OSes: `k6 run --env BASE_URL=... --env-file=.env <script>`

---

## TLS

```bash
# Any OS — default: works with self-signed / IP certs
k6 run tests/load-test.js --env BASE_URL=https://target.example.com/

# Any OS — strict TLS
k6 run tests/load-test.js --env BASE_URL=https://app.example.com/ --env SKIP_TLS_VERIFY=false
```

---

## Output & CI

```bash
k6 run tests/load-test.js --out json=results.json
k6 run tests/load-test.js --out cloud
k6 auth cloud
```

Non-zero exit when thresholds fail → safe for CI gates.

---

## Version

```bash
cat VERSION                 # 2.1.0
```

```javascript
import { VERSION } from "./src/config.js";
```

History: [CHANGELOG.md](../CHANGELOG.md)
Docs index: [README.md](../README.md)
