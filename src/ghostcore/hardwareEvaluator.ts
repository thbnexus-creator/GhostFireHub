/**
 * GhostCore Engine - Hardware Evaluation System
 * Calculates benchmark metrics, thermal stability index, and touch response tiers.
 * Designed for direct 1:1 migration into Kotlin Android Native Module (ghostcore.hardware).
 */

export interface HardwareSpecInput {
  brand: string;
  model: string;
  ramGb: number;
  chipset: string;
  refreshRate: number;
  touchSamplingRate?: number;
}

export interface HardwareEvaluationResult {
  score: number; // 1-100
  tier: 'Entry Level' | 'Mid-Tier Competitor' | 'Pro Gaming' | 'Ultra Flagship';
  estimatedFpsMax: number;
  estimatedTouchLatencyMs: number;
  thermalStabilityRating: number; // Percentage 50-99%
  recommendedGraphicSetting: 'Smooth' | 'Balanced' | 'HD' | 'Ultra HD';
  recommendedFpsCap: 30 | 60 | 90 | 120;
}

export function evaluateDeviceHardware(spec: HardwareSpecInput): HardwareEvaluationResult {
  const chipsetLower = (spec.chipset || '').toLowerCase();
  let baseScore = 60;

  if (chipsetLower.includes('gen 3') || chipsetLower.includes('gen 2') || chipsetLower.includes('dimensity 9300') || chipsetLower.includes('a17')) {
    baseScore = 95;
  } else if (chipsetLower.includes('gen 1') || chipsetLower.includes('dimensity 9000') || chipsetLower.includes('888') || chipsetLower.includes('a15')) {
    baseScore = 86;
  } else if (chipsetLower.includes('778g') || chipsetLower.includes('dimensity 8100') || chipsetLower.includes('7 gen')) {
    baseScore = 78;
  } else if (chipsetLower.includes('helio') || chipsetLower.includes('unisoc') || chipsetLower.includes('snapdragon 6')) {
    baseScore = 55;
  }

  // RAM Boost
  if (spec.ramGb >= 16) baseScore += 5;
  else if (spec.ramGb >= 12) baseScore += 3;
  else if (spec.ramGb < 4) baseScore -= 10;

  // Refresh Rate Boost
  if (spec.refreshRate >= 144) baseScore += 5;
  else if (spec.refreshRate >= 120) baseScore += 3;

  const score = Math.min(100, Math.max(30, baseScore));

  let tier: HardwareEvaluationResult['tier'] = 'Entry Level';
  if (score >= 90) tier = 'Ultra Flagship';
  else if (score >= 80) tier = 'Pro Gaming';
  else if (score >= 65) tier = 'Mid-Tier Competitor';

  let estimatedFpsMax = 60;
  let recommendedFpsCap: HardwareEvaluationResult['recommendedFpsCap'] = 60;
  if (spec.refreshRate >= 120 && score >= 80) {
    estimatedFpsMax = spec.refreshRate;
    recommendedFpsCap = spec.refreshRate as 90 | 120;
  } else if (spec.refreshRate >= 90 && score >= 70) {
    estimatedFpsMax = 90;
    recommendedFpsCap = 90;
  } else if (score < 55) {
    estimatedFpsMax = 45;
    recommendedFpsCap = 30;
  }

  const sampling = spec.touchSamplingRate || 240;
  const estimatedTouchLatencyMs = Math.round(1000 / sampling) + (score >= 80 ? 4 : 12);

  let recommendedGraphicSetting: HardwareEvaluationResult['recommendedGraphicSetting'] = 'Smooth';
  if (score >= 88) recommendedGraphicSetting = 'Ultra HD';
  else if (score >= 75) recommendedGraphicSetting = 'HD';
  else if (score >= 60) recommendedGraphicSetting = 'Balanced';

  return {
    score,
    tier,
    estimatedFpsMax,
    estimatedTouchLatencyMs,
    thermalStabilityRating: Math.min(98, Math.max(65, Math.round(75 + (spec.ramGb * 1.5)))),
    recommendedGraphicSetting,
    recommendedFpsCap
  };
}
