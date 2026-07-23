/**
 * GhostCore Engine - Recommendation Algorithm
 * Matches hardware profile, playstyle, and weapon class to produce weapon-attachment recommendations.
 * Designed for direct 1:1 migration into Kotlin Android Native Module (ghostcore.recommendation).
 */

export interface WeaponRecommendationInput {
  playStyle: string;
  gameMode: string;
  deviceTier: string;
}

export interface WeaponRecommendationResult {
  primaryWeapon: string;
  secondaryWeapon: string;
  attachmentFocus: string;
  tacticalAdvantageNote: string;
}

export function recommendWeaponSet(input: WeaponRecommendationInput): WeaponRecommendationResult {
  const isSniper = input.playStyle === 'Sniper';
  const isSpammer = input.playStyle === 'Spammer';
  const isTapper = input.playStyle === 'Tapper';

  let primary = 'M4A1-III';
  let secondary = 'MP40';
  let focus = 'Level 3 Foregrip + Muzzle Velociter';
  let note = 'Optimal recoil dampening for medium-range spray stability.';

  if (isSniper) {
    primary = 'AWM (Kar98k Hybrid)';
    secondary = 'M1887 (Double Barrel)';
    focus = 'Armor Piercer Scope + Silencer';
    note = 'Delivers maximum single-shot headshot damage with quick close-range barrel fallback.';
  } else if (isTapper) {
    primary = 'Woodpecker / AC80';
    secondary = 'UMP-45';
    focus = 'Stock Level 3 + Marksman Scope';
    note = 'Engineered for high headshot damage per tap with zero horizontal drift.';
  } else if (isSpammer) {
    primary = 'G36 / SCAR-III';
    secondary = 'MP5-III';
    focus = 'Extended Double Magazine + Recoil Compensator';
    note = 'Sustained rapid-fire suppressive spray with fast movement reload cycle.';
  }

  if (input.gameMode === 'CS Ranked') {
    note += ' Configured for quick rounds and tight corners in Clash Squad.';
  }

  return {
    primaryWeapon: primary,
    secondaryWeapon: secondary,
    attachmentFocus: focus,
    tacticalAdvantageNote: note
  };
}
