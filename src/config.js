/**
 * K6 Test Configuration Module
 * Centralized configuration for all test scripts
 * Supports environment variables for flexibility
 */

export const VERSION = "2.1.0";

// Base Configuration
export const config = {
  // API Configuration
  BASE_URL: __ENV.BASE_URL || "http://localhost:3000",
  TIMEOUT: __ENV.TIMEOUT || "30s",
  THINK_TIME_MIN: parseInt(__ENV.THINK_TIME_MIN || "1"),
  THINK_TIME_MAX: parseInt(__ENV.THINK_TIME_MAX || "3"),

  // Skip TLS verification for self-signed certs / IP-based targets
  // (e.g. https://target.example.com or https://192.0.2.10 with missing IP SANs).
  // Override with: --env SKIP_TLS_VERIFY=false
  INSECURE_SKIP_TLS_VERIFY: (__ENV.SKIP_TLS_VERIFY || "true") !== "false",

  // Default Headers
  defaultHeaders: {
    "Content-Type": "application/json",
    "User-Agent": "K6-LoadTester/2.0",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    Connection: "keep-alive",
  },

  // Default Thresholds by Test Type
  thresholds: {
    // Load test - normal operations
    load: {
      http_req_duration: ["p(95)<500", "p(99)<1000"],
      http_req_failed: ["rate<0.01"],
    },
    // Stress test - push to limits
    stress: {
      http_req_duration: ["p(95)<2000", "p(99)<5000"],
      http_req_failed: ["rate<0.05"],
    },
    // Spike test - sudden burst
    spike: {
      http_req_duration: ["p(95)<5000"],
      http_req_failed: ["rate<0.10"],
    },
    // Soak test - long-term stability
    soak: {
      http_req_duration: ["p(95)<2000", "p(99)<5000"],
      http_req_failed: ["rate<0.01"],
    },
    // Extreme plateau - hold heavy load steady, no fluctuation
    extreme: {
      http_req_duration: ["p(95)<3000", "p(99)<5000"],
      http_req_failed: ["rate<0.05"],
    },
  },

  // Common HTTP Parameters
  getDefaultParams: () => ({
    headers: config.defaultHeaders,
    timeout: config.TIMEOUT,
  }),

  // Ramping patterns
  patterns: {
    // Standard load test ramp
    standardRamp: [
      { duration: "30s", target: 20 }, // Ramp-up
      { duration: "1m", target: 20 }, // Hold
      { duration: "30s", target: 0 }, // Ramp-down
    ],

    // Progressive stress ramp
    progressiveStress: [
      { duration: "1m", target: 50 },
      { duration: "1m", target: 100 },
      { duration: "1m", target: 200 },
      { duration: "1m", target: 400 },
      { duration: "1m", target: 0 },
    ],

    // Soak ramp
    soakRamp: [
      { duration: "2m", target: 100 }, // Gradual ramp
      { duration: "10m", target: 100 }, // Long soak
      { duration: "2m", target: 0 }, // Ramp down
    ],

    // Spike pattern
    spikePattern: [
      { duration: "10s", target: 500 }, // Quick spike
      { duration: "1m", target: 500 }, // Hold spike
      { duration: "10s", target: 0 }, // Quick drop
    ],
  },
};

// Helper function to merge custom thresholds
export function getThresholds(testType, customThresholds = {}) {
  return {
    ...config.thresholds[testType],
    ...customThresholds,
  };
}

// Helper function to get default options for a test type
export function getDefaultOptions(
  testType,
  stagesOrScenario,
  customThresholds = {},
) {
  return {
    stages: stagesOrScenario,
    thresholds: getThresholds(testType, customThresholds),
    insecureSkipTLSVerify: config.INSECURE_SKIP_TLS_VERIFY,
  };
}

// Helper function to get options for a scenario-based test (e.g. constant-vus)
export function getScenarioOptions(
  testType,
  scenario,
  customThresholds = {},
) {
  return {
    scenarios: scenario,
    thresholds: getThresholds(testType, customThresholds),
    insecureSkipTLSVerify: config.INSECURE_SKIP_TLS_VERIFY,
  };
}
