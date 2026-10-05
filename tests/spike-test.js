/**
 * K6 Spike Test Script (Refactored)
 *
 * Purpose: Test system resilience to sudden traffic bursts
 * When to use: Emergency scenarios, flash sales, viral content, unexpected traffic spikes
 *
 * Pattern: Rapid spike → hold → rapid drop
 * VUs: Jump to 500+ instantly
 * Duration: ~1.5 minutes
 * Success Criteria:
 *   - 95% of requests complete in < 5000ms (relaxed due to spike)
 *   - < 10% failure rate during spike (acceptable for chaos testing)
 */

import http from "k6/http";
import { sleep } from "k6";
import { config, getDefaultOptions } from "../src/config.js";
import {
  makeRequest,
  verifyResponse,
  randomThinkTime,
  logMetric,
} from "../src/helpers.js";

// Configuration
const BASE_URL = __ENV.BASE_URL || config.BASE_URL;

// Test options with spike test thresholds
export const options = getDefaultOptions("spike", [
  { duration: "10s", target: 500 }, // SPIKE! 0 to 500 VUs in 10s
  { duration: "1m", target: 500 }, // Hold the spike
  { duration: "10s", target: 0 }, // Quick drop
]);

/**
 * Main test function
 * Simulates user behavior during traffic spike
 */
export default function () {
  try {
    // Make main page request
    const res = makeRequest(BASE_URL);

    // Verify response during spike
    verifyResponse(res, "Spike Test - Main Page", {
      "status is valid": (r) => r.status >= 100 && r.status < 600,
    });

    logMetric("Spike test request", {
      status: res.status,
      duration: `${res.timings.duration.toFixed(2)}ms`,
      vus: __VU,
      vuMax: __VU_MAX,
    });

    // Minimal think time during spike
    sleep(randomThinkTime(0.1, 1));
  } catch (error) {
    logMetric("Spike test error", {
      error: error.message,
      vus: __VU,
    });
  }
}
