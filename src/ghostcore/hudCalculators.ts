/**
 * GhostCore Engine - HUD Button Matrix & Layout Calculator
 * Calculates finger-claw coordinate presets and optimal button scaling ratios.
 * Designed for direct 1:1 migration into Kotlin Android Native Module (ghostcore.hud).
 */

export interface HUDButton {
  id: string;
  label: string;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
  size: number; // Scale 20 - 150
  opacity: number; // 0.1 - 1.0
}

export type ClawType = '2 Finger Thumb' | '3 Finger Claw' | '4 Finger Claw' | '5 Finger Hybrid';

export function calculateClawPreset(type: ClawType): HUDButton[] {
  switch (type) {
    case '3 Finger Claw':
      return [
        { id: 'fire_left', label: 'Left Fire', x: 12, y: 18, size: 85, opacity: 0.9 },
        { id: 'fire_right', label: 'Right Fire', x: 82, y: 55, size: 65, opacity: 0.7 },
        { id: 'scope', label: 'Scope', x: 84, y: 25, size: 80, opacity: 0.9 },
        { id: 'jump', label: 'Jump', x: 88, y: 72, size: 65, opacity: 0.8 },
        { id: 'crouch', label: 'Crouch', x: 76, y: 75, size: 65, opacity: 0.8 },
        { id: 'prone', label: 'Prone', x: 68, y: 82, size: 55, opacity: 0.7 },
        { id: 'joystick', label: 'Movement Joystick', x: 22, y: 68, size: 90, opacity: 0.6 },
        { id: 'gloo_wall', label: 'Gloo Wall', x: 38, y: 78, size: 80, opacity: 0.95 }
      ];
    case '4 Finger Claw':
      return [
        { id: 'fire_left', label: 'Left Fire', x: 12, y: 15, size: 95, opacity: 0.95 },
        { id: 'scope', label: 'Scope', x: 86, y: 15, size: 90, opacity: 0.95 },
        { id: 'jump', label: 'Jump', x: 88, y: 52, size: 70, opacity: 0.85 },
        { id: 'crouch', label: 'Crouch', x: 76, y: 55, size: 70, opacity: 0.85 },
        { id: 'prone', label: 'Prone', x: 66, y: 65, size: 60, opacity: 0.7 },
        { id: 'joystick', label: 'Movement Joystick', x: 18, y: 65, size: 85, opacity: 0.6 },
        { id: 'gloo_wall', label: 'Gloo Wall', x: 34, y: 75, size: 90, opacity: 1.0 },
        { id: 'reload', label: 'Quick Reload', x: 50, y: 85, size: 65, opacity: 0.8 }
      ];
    case '5 Finger Hybrid':
      return [
        { id: 'fire_left', label: 'Left Fire', x: 10, y: 12, size: 100, opacity: 0.95 },
        { id: 'map', label: 'Map / Intel', x: 32, y: 10, size: 70, opacity: 0.7 },
        { id: 'scope', label: 'Scope', x: 88, y: 12, size: 95, opacity: 0.95 },
        { id: 'weapon_switch', label: 'Quick Switch', x: 88, y: 38, size: 80, opacity: 0.9 },
        { id: 'jump', label: 'Jump', x: 88, y: 62, size: 70, opacity: 0.85 },
        { id: 'crouch', label: 'Crouch', x: 76, y: 65, size: 70, opacity: 0.85 },
        { id: 'joystick', label: 'Movement Joystick', x: 16, y: 62, size: 85, opacity: 0.6 },
        { id: 'gloo_wall', label: 'Gloo Wall', x: 32, y: 72, size: 95, opacity: 1.0 }
      ];
    case '2 Finger Thumb':
    default:
      return [
        { id: 'fire_right', label: 'Fire Button', x: 82, y: 55, size: 80, opacity: 0.85 },
        { id: 'scope', label: 'Scope', x: 82, y: 32, size: 70, opacity: 0.8 },
        { id: 'jump', label: 'Jump', x: 88, y: 75, size: 65, opacity: 0.8 },
        { id: 'crouch', label: 'Crouch', x: 75, y: 78, size: 65, opacity: 0.8 },
        { id: 'joystick', label: 'Movement Joystick', x: 22, y: 65, size: 100, opacity: 0.7 },
        { id: 'gloo_wall', label: 'Gloo Wall', x: 40, y: 80, size: 80, opacity: 0.9 }
      ];
  }
}
