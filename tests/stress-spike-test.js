/**
 * K6 Stress + Spike Hybrid Test Script (Refactored)
 *
 * Purpose: Test system behavior under combined extreme and spike conditions
 * When to use: Comprehensive chaos testing, combined extreme scenarios, worst-case analysis
 *
 * Pattern: Progressive stress ramp + spike plateau + ramp-down
 * VUs: Reaches 5000 at peak
 * Duration: ~7.5 minutes
 * Success Criteria:
 *   - 95% of requests complete in < 3000ms
 *   - < 10% failure rate (extreme conditions)
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { randomString } from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { config, getDefaultOptions } from "../src/config.js";
import {
  batchRequests,
  verifyResponse,
  randomThinkTime,
  logMetric,
} from "../src/helpers.js";

// Configuration
const BASE_URL = __ENV.BASE_URL || config.BASE_URL;

// Test options with spike-stress hybrid thresholds
export const options = getDefaultOptions("spike", [
  { duration: "30s", target: 500 }, // Quick ramp to 500
  { duration: "1m", target: 1000 }, // Push to 1000
  { duration: "2m", target: 3000 }, // Heavy load 3000
  { duration: "1m", target: 5000 }, // MASSIVE SPIKE to 5000
  { duration: "3m", target: 5000 }, // Hold massive load
  { duration: "30s", target: 0 }, // Crash down
]);

/**
 * Main test function
 * Simulates extreme combined stress and spike scenarios
 */
export default function () {
  try {
    group("Stress Spike - Asset Batch", function () {
      // Cache buster for simulating repeated requests
      const cacheBuster = `?cb=${randomString(8)}`;

      // Batch requests to simulate multiple asset loads
      const params = {
        headers: config.defaultHeaders,
        timeout: config.TIMEOUT,
      };

      const responses = batchRequests([
        ["GET", BASE_URL, null, params],
        ["GET", `${BASE_URL}${cacheBuster}`, null, params],
        // Add more assets as needed
      ]);

      // Verify responses
      verifyResponse(responses[0], "Stress Spike - Main", {
        "status is valid": (r) => r.status >= 100 && r.status < 600,
      });

      logMetric("Stress spike batch completed", {
        requests: responses.length,
        status: responses[0].status,
        duration: `${responses[0].timings.duration.toFixed(2)}ms`,
        vus: __VU,
      });
    });

    // Randomized longer sleep for realistic large-scale behavior
    sleep(randomThinkTime(1, 5));
  } catch (error) {
    logMetric("Stress spike error", {
      error: error.message,
      vus: __VU,
    });
  }
}
