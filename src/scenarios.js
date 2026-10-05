/**
 * K6 Scenarios Module
 * Pre-configured scenario definitions for different test types
 */

import { config, getThresholds } from "./config.js";

/**
 * Standard Load Test Scenario
 * Simulates normal traffic with gradual ramp-up and ramp-down
 * Use when: Baseline performance testing, capacity planning
 */
export const loadTestScenario = {
  executor: "ramping-vus",
  stages: config.patterns.standardRamp,
  gracefulStop: "30s",
  env: { TEST_TYPE: "load" },
};

/**
 * Stress Test Scenario
 * Progressively increases load to find breaking point
 * Use when: Identifying system limits, stress testing
 */
export const stressTestScenario = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: config.patterns.progressiveStress,
  gracefulRampDown: "30s",
  env: { TEST_TYPE: "stress" },
};

/**
 * Spike Test Scenario
 * Sudden burst of traffic to test emergency handling
 * Use when: Testing system resilience to traffic spikes
 */
export const spikeTestScenario = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: config.patterns.spikePattern,
  gracefulRampDown: "30s",
  env: { TEST_TYPE: "spike" },
};

/**
 * Soak Test Scenario
 * Sustained load over extended period to detect memory leaks
 * Use when: Testing system stability, long-term reliability
 */
export const soakTestScenario = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: config.patterns.soakRamp,
  gracefulRampDown: "30s",
  env: { TEST_TYPE: "soak" },
};

/**
 * Spike Stress Hybrid Scenario
 * Combines spike and stress testing patterns
 * Use when: Testing system behavior under unpredictable, extreme loads
 */
export const spikestressTestScenario = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "30s", target: 500 }, // Quick ramp
    { duration: "1m", target: 1000 }, // Stress push
    { duration: "2m", target: 3000 }, // Heavy load
    { duration: "1m", target: 5000 }, // Spike
    { duration: "3m", target: 5000 }, // Hold spike
    { duration: "30s", target: 0 }, // Quick ramp down
  ],
  gracefulRampDown: "30s",
  env: { TEST_TYPE: "spike_stress" },
};

/**
 * Ramping Scenario
 * Realistic traffic patterns with multiple ramp stages
 * Use when: Simulating real-world traffic patterns
 */
export const rampingScenario = {
  executor: "ramping-vus",
  startVUs: 0,
  stages: [
    { duration: "1m", target: 50 }, // Initial ramp
    { duration: "2m", target: 50 }, // Sustain
    { duration: "1m", target: 0 }, // Ramp down
  ],
  gracefulRampDown: "30s",
  env: { TEST_TYPE: "ramping" },
};

/**
 * Get scenario with custom thresholds
 * @param {object} baseScenario - Base scenario object
 * @param {string} testType - Test type (load, stress, spike, soak, etc.)
 * @param {object} customThresholds - Custom threshold overrides
 * @returns {object} Scenario with thresholds
 */
export function getScenarioWithThresholds(
  baseScenario,
  testType,
  customThresholds = {},
) {
  return {
    ...baseScenario,
    thresholds: getThresholds(testType, customThresholds),
  };
}

/**
 * All scenarios map for easy access
 */
export const allScenarios = {
  load: loadTestScenario,
  stress: stressTestScenario,
  spike: spikeTestScenario,
  soak: soakTestScenario,
  spike_stress: spikestressTestScenario,
  ramping: rampingScenario,
};
