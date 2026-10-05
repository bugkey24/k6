/**
 * K6 Soak Test Script (Refactored)
 *
 * Purpose: Test system stability and reliability under sustained load
 * When to use: Long-term stability, memory leak detection, resource exhaustion
 *
 * Pattern: Gradual ramp → extended sustain → gradual ramp-down
 * VUs: 100-200 (sustained)
 * Duration: ~34 minutes
 * Success Criteria:
 *   - 95% of requests complete in < 2000ms
 *   - < 1% failure rate (strict, for long-term stability)
 *   - No degradation over time
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { config, getDefaultOptions } from "../src/config.js";
import {
  batchRequests,
  verifyResponse,
  randomThinkTime,
  logMetric,
} from "../src/helpers.js";

// Configuration
const BASE_URL = __ENV.BASE_URL || config.BASE_URL;

// Test options with soak test thresholds
export const options = getDefaultOptions("soak", [
  { duration: "2m", target: 100 }, // Gradual ramp to 100 users
  { duration: "30m", target: 10000 }, // Hold for extended period (SOAK)
  { duration: "2m", target: 0 }, // Gradual ramp-down
]);

/**
 * Main test function
 * Simulates long-term user behavior
 */
export default function () {
  try {
    group("Soak Test - Main Page", function () {
      // Batch requests to simulate realistic asset loading
      const params = {
        headers: config.defaultHeaders,
        timeout: config.TIMEOUT,
      };

      const responses = batchRequests([
        ["GET", BASE_URL, null, params],
        // Add additional asset URLs if known
      ]);

      // Verify main response
      verifyResponse(responses[0], "Soak Test - Main", {
        "status is 200": (r) => r.status === 200,
        "has content": (r) => r.body && r.body.length > 0,
      });

      logMetric("Soak test batch completed", {
        requests: responses.length,
        mainStatus: responses[0].status,
        mainDuration: `${responses[0].timings.duration.toFixed(2)}ms`,
      });
    });

    // Random sleep to simulate user think time
    sleep(randomThinkTime(1, 3));
  } catch (error) {
    logMetric("Soak test error", {
      error: error.message,
      vus: __VU,
    });
  }
}
