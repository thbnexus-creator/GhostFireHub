/**
 * GhostCore™ Calculation Engine
 * Production-ready, deterministic calculation system for Free Fire sensitivity & performance matrix.
 */

export interface GhostCoreInput {
  brand: string;
  model: string;
  processor?: string;
  os?: string;
  ram?: string;
  refreshRate?: string;
  touchSamplingRate?: string;
  resolution?: string;
  screenSize?: string;
  gyroscope?: boolean;
  internetQuality?: string;
  hudLayout?: string;
  fingerSetup?: string;
  playStyle?: string;
  gameMode?: string;
  chosenWeapon?: string;
  experience?: string;
  email?: string;
  userRole?: string;
  isPremium?: boolean;
}

export interface GhostCoreOutput {
  id: string;
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  freeLook: number;
  confidenceScore: number;
  hardwareTier: string;
  explanation: string;
  recommendations: {
    fireButtonSize: string;
    dpiSetting: string;
    graphicPreset: string;
    dragTechnique: string;
    recoilControl: string;
  };
  heatMapScores: {
    cpu: number;
    gpu: number;
    thermal: number;
    touchLatency: number;
    gyroscope: number;
  };
  created_at: string;
}

export function calculateGhostCoreSensitivity(input: GhostCoreInput): GhostCoreOutput {
  const brand = input.brand || 'Generic Device';
  const model = input.model || 'Mobile Device';
  const processor = input.processor || 'Snapdragon Octa-Core';
  const ramStr = input.ram || '8 GB';
  const ramGb = parseInt(ramStr) || 8;
  const refreshStr = input.refreshRate || '120Hz';
  const refreshRateNum = parseInt(refreshStr) || 120;
  const touchSamplingStr = input.touchSamplingRate || '240Hz';
  const touchSamplingNum = parseInt(touchSamplingStr) || 240;
  const gyroscope = input.gyroscope ?? true;
  const fingerSetup = input.fingerSetup || '3-Finger';
  const playStyle = input.playStyle || 'Balanced';
  const gameMode = input.gameMode || 'Battle Royale';
  const chosenWeapon = input.chosenWeapon || 'M1887, MP40';
  const hudLayout = input.hudLayout || 'Claw Balanced';
  const experience = input.experience || 'Intermediate';
  const email = (input.email || '').toLowerCase();
  const userRole = input.userRole || '';

  // Check Super Admin privileges
  const isSuperAdmin =
    email === 'ghostfirehub@gmail.com' ||
    email === 'ghostfire@ghost.com' ||
    userRole === 'Administrator' ||
    userRole === 'SuperAdmin' ||
    userRole === 'Staff';

  // 1. Determine Hardware Tier
  const procLower = processor.toLowerCase();
  let hardwareTier = 'A Mid-Range Tier';
  let cpuScore = 72;
  let gpuScore = 70;
  let thermalScore = 75;

  if (
    procLower.includes('gen 3') ||
    procLower.includes('gen 2') ||
    procLower.includes('dimensity 9300') ||
    procLower.includes('dimensity 9200') ||
    procLower.includes('a17') ||
    procLower.includes('a18') ||
    procLower.includes('s24') ||
    procLower.includes('rog')
  ) {
    hardwareTier = 'S+ Flagship Tier';
    cpuScore = 98;
    gpuScore = 99;
    thermalScore = 92;
  } else if (
    procLower.includes('gen 1') ||
    procLower.includes('888') ||
    procLower.includes('870') ||
    procLower.includes('dimensity 8200') ||
    procLower.includes('dimensity 8000') ||
    procLower.includes('a15') ||
    procLower.includes('a16') ||
    procLower.includes('exynos 2400') ||
    procLower.includes('exynos 2200')
  ) {
    hardwareTier = 'S High Performance Tier';
    cpuScore = 88;
    gpuScore = 86;
    thermalScore = 82;
  } else if (
    procLower.includes('helio') ||
    procLower.includes('unisoc') ||
    procLower.includes('snapdragon 6') ||
    procLower.includes('exynos 1380')
  ) {
    hardwareTier = 'B Entry Level Tier';
    cpuScore = 52;
    gpuScore = 48;
    thermalScore = 65;
  }

  // Touch & Gyro scores
  const touchScore = touchSamplingNum >= 360 ? 98 : touchSamplingNum >= 240 ? 88 : touchSamplingNum >= 180 ? 75 : 55;
  const gyroScore = gyroscope ? 96 : 45;

  // 2. Compute General Sensitivity
  let baseGeneral = 175;

  // Refresh Rate modifier
  if (refreshRateNum >= 144) baseGeneral += 18;
  else if (refreshRateNum >= 120) baseGeneral += 15;
  else if (refreshRateNum >= 90) baseGeneral += 10;
  else baseGeneral += 5;

  // Touch Sampling Rate modifier
  if (touchSamplingNum < 200) baseGeneral += 6;
  else if (touchSamplingNum <= 360) baseGeneral += 4;
  else baseGeneral -= 2;

  // Finger Setup modifier
  if (fingerSetup.includes('2')) baseGeneral -= 6;
  else if (fingerSetup.includes('3')) baseGeneral += 2;
  else if (fingerSetup.includes('4')) baseGeneral += 6;
  else if (fingerSetup.includes('5')) baseGeneral += 8;

  // Playstyle modifier
  const playLower = playStyle.toLowerCase();
  if (playLower.includes('tapper') || playLower.includes('spammer') || playLower.includes('rusher') || playLower.includes('drag')) {
    baseGeneral += 8;
  } else if (playLower.includes('sniper')) {
    baseGeneral -= 8;
  }

  // Weapon modifier
  const weaponLower = chosenWeapon.toLowerCase();
  if (weaponLower.includes('m1887') || weaponLower.includes('eagle') || weaponLower.includes('woodpecker') || weaponLower.includes('shotgun')) {
    baseGeneral += 6;
  }

  // Experience modifier
  if (experience === 'Beginner') baseGeneral -= 6;
  if (experience === 'Professional') baseGeneral += 4;

  const general = Math.min(200, Math.max(100, Math.round(baseGeneral)));

  // 3. Compute Red Dot
  let baseRedDot = general;
  if (playLower.includes('tapper') || playLower.includes('headshot') || weaponLower.includes('m1887') || weaponLower.includes('eagle')) {
    baseRedDot = Math.min(200, general + 5);
  } else {
    baseRedDot = Math.round(general * 0.96);
  }
  const redDot = Math.min(200, Math.max(90, baseRedDot));

  // 4. Compute Scopes
  const scope2x = Math.min(200, Math.max(85, Math.round(redDot * 0.94 + (fingerSetup.includes('4') || fingerSetup.includes('5') ? 4 : 0))));
  const scope4x = Math.min(200, Math.max(80, Math.round(scope2x * 0.92 + (gyroscope ? 6 : 0))));

  // 5. Compute Sniper Scope
  let baseSniper = 55;
  if (playLower.includes('sniper') || weaponLower.includes('awm') || weaponLower.includes('m82b') || weaponLower.includes('kar')) {
    baseSniper = 85 + (refreshRateNum >= 120 ? 12 : 6) + (gyroscope ? 8 : 0);
  } else {
    baseSniper = 58 + (refreshRateNum >= 120 ? 6 : 2);
  }
  const sniper = Math.min(150, Math.max(35, Math.round(baseSniper)));

  // 6. Compute Free Look
  const freeLook = Math.min(200, Math.max(70, Math.round(general * 0.82 + (fingerSetup.includes('4') || fingerSetup.includes('5') ? 18 : 10))));

  // 7. Compute Confidence Score
  let confidenceScore = 91;
  if (isSuperAdmin) {
    confidenceScore = 100; // ALWAYS 100% FOR SUPER ADMIN
  } else if (input.isPremium) {
    confidenceScore = 97;
  } else if (email) {
    confidenceScore = 92;
  } else {
    confidenceScore = 85;
  }

  // 8. Generate AI Diagnostic Explanation
  const explanation = `GHOSTCORE™ AI HARDWARE DIAGNOSTIC REPORT
• Target Hardware: ${brand} ${model} (${hardwareTier})
• Chipset Compute: ${processor}
• Display Calibration: ${refreshStr} Refresh Rate | ${touchSamplingStr} Touch Sampling Rate
• Tactical Configuration: ${fingerSetup} (${hudLayout})
• Play Style & Weapons: ${playStyle} Optimization for [${chosenWeapon}]
• Gyroscope Module: ${gyroscope ? 'Active Hardware Gyroscope (1:1 Motion Assist)' : 'Disabled / Manual Touch Drag'}

[TACTICAL REMEDY & PERFORMANCE MATRIX]
1. Touch Response Coefficient: Calibrated for ${touchSamplingStr} polling rate. General sensitivity set to ${general} to eliminate swipe resistance and visual micro-stutters.
2. Headshot Drag Acceleration: Red Dot tuned to ${redDot} for instant vertical drag shots with ${chosenWeapon}.
3. Scope Recoil Dampening: 2X (${scope2x}) and 4X (${scope4x}) calibrated to secure tight bullet grouping during continuous sprays in ${gameMode}.
4. Sniper Target Tracking: Sniper Scope set to ${sniper} for quick scope-in drag shots with zero drift.`;

  // 9. Generate Tactical Recommendations
  const fireButtonSize = fingerSetup.includes('2') ? '48% - 52%' : fingerSetup.includes('3') ? '44% - 48%' : '40% - 44%';
  const dpiSetting = refreshRateNum >= 120 ? '440 - 480 DPI (High Response)' : '411 DPI (Standard Balanced)';
  const graphicPreset = hardwareTier.includes('S') ? 'Smooth + Ultra FPS (Maximum Touch Speed)' : 'Smooth + High FPS';
  const dragTechnique = playLower.includes('tapper') || weaponLower.includes('m1887') ? 'J-Shape Fast Drag Flick' : 'Straight Upward Recoil Lock';
  const recoilControl = gyroscope ? 'Shoulder-Height Crosshair + Micro Gyro Pulldown' : 'Shoulder-Height Crosshair + Thumb Drag Pulldown';

  return {
    id: 'ghostcore-' + Date.now(),
    general,
    redDot,
    scope2x,
    scope4x,
    sniper,
    freeLook,
    confidenceScore,
    hardwareTier,
    explanation,
    recommendations: {
      fireButtonSize,
      dpiSetting,
      graphicPreset,
      dragTechnique,
      recoilControl
    },
    heatMapScores: {
      cpu: cpuScore,
      gpu: gpuScore,
      thermal: thermalScore,
      touchLatency: touchScore,
      gyroscope: gyroScore
    },
    created_at: new Date().toISOString()
  };
}
