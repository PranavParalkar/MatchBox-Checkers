export const BEAD_BLUE = "#3b82f6";
export const BEAD_YELLOW = "#eab308";
export const BEAD_ORANGE = "#f97316";
export const BEAD_GREEN = "#22c55e";

export const BEAD_COLORS = [BEAD_ORANGE, BEAD_BLUE, BEAD_YELLOW, BEAD_GREEN];

export const IMAGE_BEAD_DISPLAY: Record<string, string[]> = {
  // Chance 0 — folder "2/"
  "0-0": [BEAD_BLUE, BEAD_YELLOW, BEAD_ORANGE],
  "0-1": [BEAD_BLUE, BEAD_YELLOW, BEAD_ORANGE],
  "0-2": [BEAD_BLUE, BEAD_YELLOW, BEAD_ORANGE],

  // Chance 1 — folder "4/"
  "1-0": [BEAD_BLUE],
  "1-1": [BEAD_ORANGE],
  "1-2": [BEAD_BLUE, BEAD_ORANGE],
  "1-3": [BEAD_GREEN, BEAD_BLUE],
  "1-4": [BEAD_BLUE, BEAD_YELLOW],
  "1-5": [BEAD_BLUE, BEAD_YELLOW],
  "1-6": [BEAD_YELLOW, BEAD_BLUE],
  "1-7": [BEAD_YELLOW, BEAD_ORANGE],
  "1-8": [BEAD_YELLOW, BEAD_ORANGE],
  "1-9": [BEAD_YELLOW, BEAD_ORANGE],

  // Chance 2 — folder "6/"
  "2-0": [BEAD_YELLOW],
  "2-1": [BEAD_BLUE],
  "2-2": [BEAD_YELLOW, BEAD_BLUE],
  "2-3": [BEAD_YELLOW],
  "2-4": [BEAD_BLUE, BEAD_YELLOW],
  "2-5": [BEAD_ORANGE, BEAD_BLUE],
  "2-6": [BEAD_ORANGE, BEAD_BLUE],
  "2-7": [BEAD_YELLOW],
  "2-8": [BEAD_YELLOW, BEAD_ORANGE, BEAD_BLUE],
  "2-9": [BEAD_ORANGE, BEAD_BLUE],
  "2-10": [BEAD_BLUE],
  "2-11": [BEAD_YELLOW],

  // Chance 3 — folder "8/"
  "3-0": [BEAD_YELLOW, BEAD_ORANGE],
  "3-1": [BEAD_YELLOW, BEAD_ORANGE],
  "3-2": [BEAD_BLUE, BEAD_ORANGE],
  "3-3": [BEAD_BLUE],
  "3-4": [BEAD_YELLOW, BEAD_ORANGE],
  "3-5": [BEAD_YELLOW, BEAD_ORANGE],
  "3-6": [BEAD_BLUE],
};

export function getInitialBeadsForImage(
  chance: number,
  imageIndex: number
): string[] {
  const key = `${chance}-${imageIndex}`;
  return IMAGE_BEAD_DISPLAY[key] || [];
}

export function getBeadColorName(hex: string): string {
  switch (hex) {
    case BEAD_BLUE:
      return "Blue";
    case BEAD_YELLOW:
      return "Yellow";
    case BEAD_ORANGE:
      return "Orange";
    case BEAD_GREEN:
      return "Green";
    default:
      return "Unknown";
  }
}
