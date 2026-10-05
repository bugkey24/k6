/**
 * K6 API Test Script (Refactored)
 *
 * Purpose: Basic API endpoint testing with standard checks
 * When to use: API validation, endpoint health checks, quick smoke tests
 *
 * Pattern: Simple request verification
 * VUs: 10 concurrent users
 * Duration: 30 seconds
 * Success Criteria:
 *   - Status code 200
 *   - Response time < 500ms
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

// Test options - basic API test
export const options = getDefaultOptions("load", [
  { duration: "30s", target: 10 }, // 10 concurrent users
]);

/**
 * Main test function
 * Basic API endpoint testing
 */
export default function () {
  try {
    const res = makeRequest(BASE_URL);

    verifyResponse(res, "API Test", {
      "status is 200": (r) => r.status === 200,
      "response body exists": (r) => r.body && r.body.length > 0,
      "response time < 500ms": (r) => r.timings.duration < 500,
    });

    logMetric("API test request", {
      status: res.status,
      duration: `${res.timings.duration.toFixed(2)}ms`,
    });

    sleep(randomThinkTime());
  } catch (error) {
    logMetric("API test error", { error: error.message });
  }
}
