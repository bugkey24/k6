/**
 * K6 Ramping Scenario Script (Refactored)
 *
 * Purpose: Simulate realistic traffic patterns with multiple ramp stages
 * When to use: Simulating real-world traffic, time-based load patterns, business hours simulation
 *
 * Pattern: Progressive ramp-up with multiple sustained plateaus
 * VUs: Reaches 50 users
 * Duration: ~4 minutes
 * Success Criteria:
 *   - 95% of requests complete in < 500ms
 *   - < 1% failure rate
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

// Test options with load test thresholds
export const options = getDefaultOptions("load", [
  { duration: "1m", target: 50 }, // Ramp-up to 50 users
  { duration: "2m", target: 50 }, // Hold at 50 users
  { duration: "1m", target: 0 }, // Ramp-down to 0
]);

/**
 * Main test function
 * Simulates user browsing patterns
 */
export default function () {
  try {
    // Make main page request
    const res = makeRequest(BASE_URL);

    // Verify response
    verifyResponse(res, "Ramping - Main Page", {
      "status is 200": (r) => r.status === 200,
      "response time acceptable": (r) => r.timings.duration < 2000,
    });

    logMetric("Ramping test request", {
      status: res.status,
      duration: `${res.timings.duration.toFixed(2)}ms`,
      vus: __VU,
    });

    // User think time
    sleep(randomThinkTime());
  } catch (error) {
    logMetric("Ramping test error", {
      error: error.message,
    });
  }
}
