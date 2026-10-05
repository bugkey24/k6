/**
 * K6 Stress Test Script (Refactored)
 *
 * Purpose: Push system to its limits through progressive load increase
 * When to use: Finding breaking points, capacity limits, system behavior under extreme load
 *
 * Pattern: Progressive ramp (50 → 100 → 200 → 400 → 0 VUs)
 * VUs: Up to 400 (simulated concurrent users)
 * Duration: ~5 minutes
 * Success Criteria:
 *   - 95% of requests complete in < 2000ms
 *   - < 5% failure rate (relaxed due to stress conditions)
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

// Test options with stress test thresholds
export const options = getDefaultOptions("stress", [
  { duration: "1m", target: 50 }, // Ramp to 50 users
  { duration: "1m", target: 100 }, // Increase to 100 users
  { duration: "1m", target: 200 }, // Double to 200 users
  { duration: "1m", target: 400 }, // Push to 400 users
  { duration: "1m", target: 0 }, // Ramp-down
]);

/**
 * Main test function
 * Simulates user behavior under increasing load
 */
export default function () {
  try {
    // Make main page request
    const res = makeRequest(BASE_URL);

    // Verify response with relaxed criteria
    verifyResponse(res, "Stress Test - Main Page", {
      "status is 2xx": (r) => r.status >= 200 && r.status < 300,
    });

    logMetric("Stress test request", {
      status: res.status,
      duration: `${res.timings.duration.toFixed(2)}ms`,
      vus: __VU,
    });

    // Minimal think time under stress
    sleep(randomThinkTime(0.5, 2));
  } catch (error) {
    logMetric("Stress test error", {
      error: error.message,
      vus: __VU,
    });
  }
}
