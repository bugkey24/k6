/**
 * K6 Load Test Script (Refactored)
 *
 * Purpose: Baseline performance testing under normal traffic conditions
 * When to use: Capacity planning, baseline metrics, normal operations
 *
 * Pattern: Gradual ramp-up → sustain → gradual ramp-down
 * VUs: 20 (simulated concurrent users)
 * Duration: ~2 minutes
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
  { duration: "30s", target: 20 }, // Ramp-up to 20 users
  { duration: "1m", target: 20 }, // Hold at 20 users
  { duration: "30s", target: 0 }, // Ramp-down to 0
]);

/**
 * Main test function
 * Simulates a typical user visiting the main page
 */
export default function () {
  try {
    // Make main page request
    const res = makeRequest(BASE_URL);

    // Verify response
    verifyResponse(res, "Load Test - Main Page", {
      "status is 200": (r) => r.status === 200,
      "has content": (r) => r.body && r.body.length > 0,
    });

    logMetric("Request completed", {
      url: BASE_URL,
      status: res.status,
      duration: `${res.timings.duration.toFixed(2)}ms`,
    });

    // Simulate user think time
    sleep(randomThinkTime());
  } catch (error) {
    logMetric("Load test error", { error: error.message });
    throw error;
  }
}
