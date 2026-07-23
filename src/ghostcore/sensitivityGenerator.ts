/**
 * GhostCore Engine - Sensitivity Generation Algorithm
 * Pure mathematical computation for mobile tactical game sensitivity profiles.
 * Designed for direct 1:1 migration into Kotlin Android Native Module (ghostcore.sensitivity).
 */

export interface SensitivityCalculationInput {
  ramGb: number;
  chipsetTier: 'budget' | 'midrange' | 'flagship' | 'gaming';
  refreshRate: number; // 60, 90, 120, 144 Hz
  touchSamplingRate?: number; // Hz (e.g. 180, 240, 360, 720)
  playStyle: 'Tapper' | 'Spammer' | 'Tap & Spam Hybrid' | 'Sniper' | 'Balanced';
  gameMode: 'Battle Royale' | 'Clash Squad' | 'CS Ranked' | 'Lone Wolf' | 'Headshot Room' | 'Custom Room' | 'Training Ground';
  preferredScopeMultiplier?: number;
}

export interface SensitivityProfileOutput {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  freeLook: number;
  calcConfidence: number; // Percentage
  fovCompensationFactor: number;
}

export function generateTacticalSensitivity(input: SensitivityCalculationInput): SensitivityProfileOutput {
  let baseGeneral = 95;
  let baseRedDot = 90;
  let baseScope2x = 85;
  let baseScope4x = 75;
  let baseSniper = 45;
  let baseFreeLook = 70;

  // Chipset & Refresh Rate Scaling Factor
  let hzMultiplier = 1.0;
  if (input.refreshRate >= 120) {
    hzMultiplier = 1.12;
  } else if (input.refreshRate >= 90) {
    hzMultiplier = 1.06;
  } else {
    hzMultiplier = 0.95;
  }

  // RAM Scaling
  let ramFactor = 1.0;
  if (input.ramGb < 4) {
    ramFactor = 1.08; // Increase sens for lower RAM / higher input delay compensation
  } else if (input.ramGb >= 12) {
    ramFactor = 0.96;
  }

  // Touch Sampling Rate Compensation
  const samplingHz = input.touchSamplingRate || 240;
  const touchFactor = samplingHz >= 360 ? 0.94 : samplingHz <= 180 ? 1.05 : 1.0;

  // Playstyle Modifiers
  let styleGeneralMod = 0;
  let styleRedDotMod = 0;
  let styleSniperMod = 0;

  switch (input.playStyle) {
    case 'Tapper':
      styleGeneralMod = 12;
      styleRedDotMod = 15;
      styleSniperMod = -5;
      break;
    case 'Spammer':
      styleGeneralMod = 5;
      styleRedDotMod = 8;
      styleSniperMod = 0;
      break;
    case 'Tap & Spam Hybrid':
      styleGeneralMod = 8;
      styleRedDotMod = 10;
      styleSniperMod = -2;
      break;
    case 'Sniper':
      styleGeneralMod = -8;
      styleRedDotMod = -5;
      styleSniperMod = 18;
      break;
    case 'Balanced':
    default:
      styleGeneralMod = 0;
      styleRedDotMod = 0;
      styleSniperMod = 0;
      break;
  }

  // Game Mode Adjustments
  let modeMod = 0;
  if (input.gameMode === 'CS Ranked' || input.gameMode === 'Clash Squad') {
    modeMod = 4;
  } else if (input.gameMode === 'Headshot Room') {
    modeMod = 10;
  } else if (input.gameMode === 'Custom Room') {
    modeMod = 2;
  }

  // Final Calculations clamped strictly between 1 and 200 (standard Mobile scale)
  const clamp = (val: number, min = 1, max = 200) => Math.min(max, Math.max(min, Math.round(val)));

  const general = clamp((baseGeneral + styleGeneralMod + modeMod) * hzMultiplier * ramFactor * touchFactor);
  const redDot = clamp((baseRedDot + styleRedDotMod + modeMod) * hzMultiplier * ramFactor * touchFactor);
  const scope2x = clamp((baseScope2x + Math.round(styleRedDotMod * 0.7) + modeMod) * hzMultiplier * ramFactor);
  const scope4x = clamp((baseScope4x + Math.round(styleRedDotMod * 0.5)) * hzMultiplier * ramFactor);
  const sniper = clamp((baseSniper + styleSniperMod) * (input.refreshRate >= 120 ? 0.95 : 1.0));
  const freeLook = clamp((baseFreeLook + modeMod) * touchFactor);

  const confidenceScore = Math.min(99, Math.max(82, 85 + (input.touchSamplingRate ? 5 : 0) + (input.ramGb >= 6 ? 5 : 0)));

  return {
    general,
    redDot,
    scope2x,
    scope4x,
    sniper,
    freeLook,
    calcConfidence: confidenceScore,
    fovCompensationFactor: Number(hzMultiplier.toFixed(2))
  };
}
