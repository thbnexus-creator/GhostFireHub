/**
 * GhostCore Engine - AI Technical Breakdown Generator
 * Produces structured tactical diagnostic explanations for hardware and sensitivity profiles.
 * Designed for direct 1:1 migration into Kotlin Android Native Module (ghostcore.ai).
 */

export interface SensitivityAnalysisExplanation {
  headline: string;
  recoilAnalysis: string;
  touchResponseAnalysis: string;
  headshotOptimizationNote: string;
}

export function generateSensitivityExplanation(
  brand: string,
  model: string,
  generalSens: number,
  fps: number
): SensitivityAnalysisExplanation {
  return {
    headline: `Tactical Calibration Matrix for ${brand} ${model}`,
    recoilAnalysis: `At ${generalSens}% General Sensitivity, vertical drag speed matches the screen frame rate (${fps} FPS) to prevent scope overshoot while pulling down.`,
    touchResponseAnalysis: `Touch digitizer curves adjusted for ${brand} display firmware to eliminate tap response micro-stutter during rapid scope-in sequences.`,
    headshotOptimizationNote: `Red Dot and 2x Scope multipliers are offset to align with standard Free Fire headshot drag angles.`
  };
}
