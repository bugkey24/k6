# Configuration Reference

**Suite version**: 2.1.0

![k6](https://img.shields.io/badge/k6-load%20testing-369661?logo=grafana&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)

> ⚠️ **Authorized use only** — see [README disclaimer](../README.md#disclaimer--authorized-use-only).
> Examples use dummy hosts (`app.example.com`) and documentation IPs (`192.0.2.10`).

---

## Environment variables

Defined in `.env` / `.env.example` or passed via `--env`.
All scripts read them through `src/config.js` (plateau knobs only in `tests/extreme-plateau-test.js`).

| Variable | Default | Consumed by | Description |
| --- | --- | --- | --- |
| `BASE_URL` | `http://localhost:3000` | all scripts | Target URL |
| `TIMEOUT` | `30s` | `config.TIMEOUT` | HTTP request timeout |
| `THINK_TIME_MIN` | `1` | `randomThinkTime()` | Min think time (seconds) |
| `THINK_TIME_MAX` | `3` | `randomThinkTime()` | Max think time (seconds) |
| `SKIP_TLS_VERIFY` | `true` | `config.INSECURE_SKIP_TLS_VERIFY` | Skip TLS certificate verification |
| `TARGET_VUS` | `300` | `extreme-plateau-test.js` | Plateau VU count |
| `EXTREME_DURATION` | `10m` | `extreme-plateau-test.js` | Plateau hold duration |
| `RAMP_IN` | `0s` | `extreme-plateau-test.js` | Optional ramp-in (`0` = pure `constant-vus`) |

### Passing variables

```bash
# All OSes (.env file recommended)
k6 run --env-file=.env tests/load-test.js
k6 run tests/load-test.js --env BASE_URL=http://localhost:8080 --env TIMEOUT=60s
```

```bash
# Linux / macOS — shell environment
export BASE_URL=http://localhost:3000 && k6 run tests/load-test.js
```

```powershell
# Windows PowerShell — shell environment
$env:BASE_URL = "http://localhost:3000"
k6 run tests/load-test.js
```

Platform notes: docs use bash as the default shell; Windows PowerShell users can run the same `k6` CLI flags, or use `--env-file=.env` to avoid shell-specific exports.

---

## `src/config.js` API

### Exports

| Export | Type | Description |
| --- | --- | --- |
| `VERSION` | `string` | Suite version, e.g. `"2.1.0"` (mirrors root `VERSION` file) |
| `config` | object | Central runtime config |
| `getThresholds(testType, customThresholds?)` | function | Merge profile + custom thresholds |
| `getDefaultOptions(testType, stages, customThresholds?)` | function | k6 options with `stages` |
| `getScenarioOptions(testType, scenario, customThresholds?)` | function | k6 options with `scenarios` |

### `config` object

| Field | Default | Notes |
| --- | --- | --- |
| `BASE_URL` | `__ENV.BASE_URL` or `http://localhost:3000` | |
| `TIMEOUT` | `__ENV.TIMEOUT` or `30s` | |
| `THINK_TIME_MIN` / `THINK_TIME_MAX` | `1` / `3` | Parsed ints |
| `INSECURE_SKIP_TLS_VERIFY` | `SKIP_TLS_VERIFY` is not `"false"` | Emitted as `insecureSkipTLSVerify` |
| `defaultHeaders` | Content-Type, User-Agent, Accept-Encoding, Accept-Language, Connection | |
| `thresholds.*` | see below | Named profiles |
| `getDefaultParams()` | headers + timeout | |
| `patterns.*` | `standardRamp`, `progressiveStress`, `soakRamp`, `spikePattern` | Reused by `scenarios.js` |

### Threshold profiles

| Profile | `http_req_duration` | `http_req_failed` | Used by |
| --- | --- | --- | --- |
| `load` | p(95)<500ms, p(99)<1000ms | rate<0.01 | api, load, ramping |
| `stress` | p(95)<2000ms, p(99)<5000ms | rate<0.05 | stress |
| `spike` | p(95)<5000ms | rate<0.10 | spike, stress-spike |
| `soak` | p(95)<2000ms, p(99)<5000ms | rate<0.01 | soak |
| `extreme` | p(95)<3000ms, p(99)<5000ms | rate<0.05 | extreme-plateau |

### Option builders

```javascript
import { getDefaultOptions, getScenarioOptions } from "../src/config.js";

// Stages-based (ramping-vus)
export const options = getDefaultOptions("load", [
  { duration: "30s", target: 20 },
  { duration: "1m", target: 20 },
  { duration: "30s", target: 0 },
]);

// Scenario-based (e.g. constant-vus plateau)
export const options = getScenarioOptions("extreme", {
  extreme_plateau: {
    executor: "constant-vus",
    vus: 300,
    duration: "10m",
    gracefulStop: "30s",
  },
});
```

Both builders attach:

- `thresholds` — named profile + custom overrides
- `insecureSkipTLSVerify` — from `config.INSECURE_SKIP_TLS_VERIFY`

### Custom thresholds

```javascript
export const options = getDefaultOptions(
  "load",
  [{ duration: "1m", target: 50 }],
  {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.02"],
  },
);
```

Custom keys replace the same keys from the profile.

---

## `src/helpers.js` API

| Function | Signature | Description |
| --- | --- | --- |
| `makeRequest` | `(url, params?)` | GET with default params merged; logs and rethrows on error |
| `batchRequests` | `(requests)` | `[method, url, body, params]` tuples → `http.batch` |
| `verifyResponse` | `(response, testName, checks?)` | Default checks: `status is 2xx`, `response time < 5s`; custom checks override same-named keys |
| `randomThinkTime` | `(min?, max?)` | Seconds in `[min, max]`; falls back to `THINK_TIME_MIN/MAX` |
| `logMetric` | `(message, metrics?)` | Timestamped `console.log` with JSON metrics |
| `logResponseStats` | `(responses)` | min/max/avg duration + count |
| `executeGroup` | `(groupName, testFunc)` | `group()` with error logging |
| `sleepWithLogging` | `(seconds, reason?)` | Note only — `sleep()` must be imported in the calling script |

---

## `src/scenarios.js` API

Reusable k6 scenario objects (executors + stages). Import and wrap with thresholds:

| Export | Executor | Stages source |
| --- | --- | --- |
| `loadTestScenario` | ramping-vus | `config.patterns.standardRamp` |
| `stressTestScenario` | ramping-vus | `config.patterns.progressiveStress` |
| `spikeTestScenario` | ramping-vus | `config.patterns.spikePattern` |
| `soakTestScenario` | ramping-vus | `config.patterns.soakRamp` |
| `spikestressTestScenario` | ramping-vus | inline 500→5000 hybrid |
| `rampingScenario` | ramping-vus | inline 50→50→0 |

| Function | Description |
| --- | --- |
| `getScenarioWithThresholds(baseScenario, testType, customThresholds?)` | Spread scenario + attach thresholds |
| `allScenarios` | Map keyed by `load`, `stress`, `spike`, `soak`, `spike_stress`, `ramping` |

```javascript
import { loadTestScenario } from "../src/scenarios.js";
import { getThresholds } from "../src/config.js";

export const options = {
  scenarios: { load: loadTestScenario },
  thresholds: getThresholds("load"),
};
```

---

## TLS behavior

- Flag: `SKIP_TLS_VERIFY` (default `true` → verification skipped)
- Wired as `insecureSkipTLSVerify` on all k6 options via the option builders
- Purpose: self-signed certs and IP targets without IP SANs
- Override: `--env SKIP_TLS_VERIFY=false` for strict validation
- One-off CLI equivalent: `k6 run --insecure-skip-tls-verify ...`

---

## Versioning

| Source | Location |
| --- | --- |
| Root version file | `VERSION` (e.g. `2.1.0`) |
| JS export | `import { VERSION } from "../src/config.js"` |
| Changelog | [../CHANGELOG.md](../CHANGELOG.md) |

Scheme: [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`.

| Change type | Bump |
| --- | --- |
| New test script, new env var, new threshold profile, docs | MINOR |
| Breaking config/API change, removed script, changed defaults | MAJOR |
| Bugfix, doc typo | PATCH |

**Release checklist**

1. Update `VERSION` and `src/config.js` `VERSION` export
2. Add a section to `CHANGELOG.md`
3. Update `.env.example` if new env vars were added
4. Update `README.md`, `docs/TESTS.md`, `docs/CONFIGURATION.md` as needed
5. Smoke: `k6 run tests/api-test.js` and archive-check plateau script

---

## Related docs

- [TESTS.md](./TESTS.md) — per-script reference
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) — command lookup
- [INSTALL.md](./INSTALL.md) — full install + troubleshooting
- [../CHANGELOG.md](../CHANGELOG.md) — version history
