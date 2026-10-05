/**
 * K6 Helper Utilities Module
 * Reusable functions for common test operations
 */

import http from "k6/http";
import { check, group } from "k6";
import { config } from "./config.js";

/**
 * Make a GET request with common error handling
 * @param {string} url - The URL to request
 * @param {object} params - Optional HTTP parameters
 * @param {string} checkName - Optional name for the check group
 * @returns {object} The HTTP response
 */
export function makeRequest(url, params = {}, checkName = "API Request") {
  const finalParams = {
    ...config.getDefaultParams(),
    ...params,
  };

  try {
    const res = http.get(url, finalParams);
    return res;
  } catch (error) {
    console.error(`Request failed for ${url}: ${error.message}`);
    throw error;
  }
}

/**
 * Make multiple requests in batch for asset loading
 * @param {array} requests - Array of [method, url, payload, params] tuples
 * @returns {array} Array of responses
 */
export function batchRequests(requests) {
  return http.batch(requests);
}

/**
 * Verify HTTP response status and log results
 * @param {object} response - HTTP response object
 * @param {string} testName - Name of the test
 * @param {object} checks - Additional checks to perform
 * @returns {boolean} Whether all checks passed
 */
export function verifyResponse(response, testName, checks = {}) {
  const defaultChecks = {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
    "response time < 5s": (r) => r.timings.duration < 5000,
    ...checks,
  };

  return check(response, {
    ...defaultChecks,
  });
}

/**
 * Generate random think time between user interactions
 * @param {number} min - Minimum time in seconds
 * @param {number} max - Maximum time in seconds
 * @returns {number} Random time in milliseconds
 */
export function randomThinkTime(min = null, max = null) {
  const minTime = min || config.THINK_TIME_MIN;
  const maxTime = max || config.THINK_TIME_MAX;
  return Math.random() * (maxTime - minTime) + minTime;
}

/**
 * Execute a group of requests with error handling
 * @param {string} groupName - Name of the group
 * @param {function} testFunc - Function containing test logic
 */
export function executeGroup(groupName, testFunc) {
  group(groupName, () => {
    try {
      testFunc();
    } catch (error) {
      console.error(`Group ${groupName} failed: ${error.message}`);
      throw error;
    }
  });
}

/**
 * Log test metrics during execution
 * @param {string} message - Message to log
 * @param {object} metrics - Optional metrics object
 */
export function logMetric(message, metrics = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, JSON.stringify(metrics));
}

/**
 * Calculate and log response time statistics
 * @param {array} responses - Array of response objects
 */
export function logResponseStats(responses) {
  const times = responses.map((r) => r.timings.duration);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  logMetric("Response Time Stats", {
    min: `${min.toFixed(2)}ms`,
    max: `${max.toFixed(2)}ms`,
    avg: `${avg.toFixed(2)}ms`,
    count: times.length,
  });
}

/**
 * Sleep with logging for debugging
 * @param {number} seconds - Number of seconds to sleep
 * @param {string} reason - Optional reason for sleeping
 */
export function sleepWithLogging(seconds, reason = "") {
  if (reason) {
    logMetric(`Sleeping for ${seconds}s - ${reason}`);
  }
  // Note: sleep() must be imported from 'k6' in the calling script
}
