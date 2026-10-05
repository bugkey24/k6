/**
 * K6 Extreme Plateau Test Script
 *
 * Purpose: Hold extreme load steady to measure stability at the limit
 * When to use: Maximum sustainable capacity without ramp noise or fluctuation
 *
 * Pattern: Optional brief ramp-in → flat plateau (no VU fluctuation) → graceful stop
 * VUs: Adjustable via TARGET_VUS (default 300)
 * Duration: Adjustable via EXTREME_DURATION (default 10m)
 * Success Criteria:
 *   - 95% of requests complete in < 3000ms
 *   - < 5% failure rate while held at extreme load
 */

import { sleep } from "k6";
import { config, getThresholds } from "../src/config.js";
import {
  makeRequest,
  verifyResponse,
  randomThinkTime,
  logMetric,
} from "../src/helpers.js";

const BASE_URL = __ENV.BASE_URL || config.BASE_URL;
const TARGET_VUS = parseInt(__ENV.TARGET_VUS || "300", 10);
const EXTREME_DURATION = __ENV.EXTREME_DURATION || "10m";
const RAMP_IN = __ENV.RAMP_IN || "0s";

function parseDurationToSeconds(value) {
  const match = /^(\d+)(ms|s|m|h)?$/.exec(String(value).trim());
  if (!match) return 0;
  const n = parseInt(match[1], 10);
  const unit = match[2] || "s";
  if (unit === "ms") return n / 1000;
  if (unit === "m") return n * 60;
  if (unit === "h") return n * 3600;
  return n;
}

const RAMP_IN_SECONDS = parseDurationToSeconds(RAMP_IN);

if (!Number.isFinite(TARGET_VUS) || TARGET_VUS < 1) {
  throw new Error(`Invalid TARGET_VUS: ${__ENV.TARGET_VUS}`);
}
if (!/^\d+(ms|s|m|h)$/.test(EXTREME_DURATION)) {
  throw new Error(`Invalid EXTREME_DURATION: ${EXTREME_DURATION}`);
}

const thresholds = getThresholds("extreme");

// RAMP_IN=0 → constant-vus (zero VU fluctuation for the whole run)
// RAMP_IN>0 → brief ramp then flat hold (no mid-test fluctuation, no ramp-down)
export const options =
  RAMP_IN_SECONDS > 0
    ? {
        stages: [
          { duration: RAMP_IN, target: TARGET_VUS },
          { duration: EXTREME_DURATION, target: TARGET_VUS },
        ],
        thresholds,
        insecureSkipTLSVerify: config.INSECURE_SKIP_TLS_VERIFY,
      }
    : {
        scenarios: {
          extreme_plateau: {
            executor: "constant-vus",
            vus: TARGET_VUS,
            duration: EXTREME_DURATION,
            gracefulStop: "30s",
          },
        },
        thresholds,
        insecureSkipTLSVerify: config.INSECURE_SKIP_TLS_VERIFY,
      };

export function setup() {
  logMetric("Extreme plateau test config", {
    baseUrl: BASE_URL,
    targetVus: TARGET_VUS,
    duration: EXTREME_DURATION,
    rampIn: RAMP_IN,
    executor: RAMP_IN_SECONDS > 0 ? "ramping-vus (flat hold)" : "constant-vus",
  });
}

let iteration = 0;

export default function () {
  try {
    const res = makeRequest(BASE_URL);

    verifyResponse(res, "Extreme Plateau - Main", {
      "has content": (r) => r.body && r.body.length > 0,
    });

    // Per-VU heartbeat keeps console usable at high VU counts
    iteration += 1;
    if (iteration % 25 === 0) {
      logMetric("Extreme plateau heartbeat", {
        vus: __VU,
        status: res.status,
        duration: `${res.timings.duration.toFixed(2)}ms`,
      });
    }

    sleep(randomThinkTime(0.2, 0.8));
  } catch (error) {
    logMetric("Extreme plateau error", {
      error: error.message,
      vus: __VU,
    });
  }
}
