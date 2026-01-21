export type BoneName =
  | 'hips'
  | 'spine'
  | 'chest'
  | 'neck'
  | 'head'
  | 'shoulderL'
  | 'armUpperL'
  | 'armLowerL'
  | 'handL'
  | 'shoulderR'
  | 'armUpperR'
  | 'armLowerR'
  | 'handR'
  | 'legUpperL'
  | 'legLowerL'
  | 'footL'
  | 'legUpperR'
  | 'legLowerR'
  | 'footR';

export type PoseData = Record<BoneName, [number, number, number]>;

const DEG2RAD = Math.PI / 180;

export const POSES: Record<string, PoseData> = {
  standing: {
    hips: [0, 0, 0],
    spine: [0, 0, 0],
    chest: [0, 0, 0],
    neck: [0, 0, 0],
    head: [0, 0, 0],
    shoulderL: [0, 0, 0],
    armUpperL: [0, 0, 10 * DEG2RAD],
    armLowerL: [0, 0, 0],
    handL: [0, 0, 0],
    shoulderR: [0, 0, 0],
    armUpperR: [0, 0, -10 * DEG2RAD],
    armLowerR: [0, 0, 0],
    handR: [0, 0, 0],
    legUpperL: [0, 0, 0],
    legLowerL: [0, 0, 0],
    footL: [0, 0, 0],
    legUpperR: [0, 0, 0],
    legLowerR: [0, 0, 0],
    footR: [0, 0, 0],
  },
  pushing: {
    hips: [20 * DEG2RAD, 0, 0],
    spine: [10 * DEG2RAD, 0, 0],
    chest: [10 * DEG2RAD, 0, 0],
    neck: [-20 * DEG2RAD, 0, 0], // Look up
    head: [-10 * DEG2RAD, 0, 0],
    shoulderL: [0, 0, 0],
    armUpperL: [-80 * DEG2RAD, 0, 0], // Arms forward
    armLowerL: [-45 * DEG2RAD, 0, 0], // Bent elbows
    handL: [0, 0, 0],
    shoulderR: [0, 0, 0],
    armUpperR: [-80 * DEG2RAD, 0, 0],
    armLowerR: [-45 * DEG2RAD, 0, 0],
    handR: [0, 0, 0],
    legUpperL: [-30 * DEG2RAD, 0, 0], // Step back
    legLowerL: [20 * DEG2RAD, 0, 0],
    footL: [10 * DEG2RAD, 0, 0],
    legUpperR: [10 * DEG2RAD, 0, 0], // Step forward
    legLowerR: [45 * DEG2RAD, 0, 0],
    footR: [-20 * DEG2RAD, 0, 0],
  },
  despair: {
    hips: [0, 0, 0], // Lowered position handled by position, not rotation usually, but here we rotate hips
    spine: [30 * DEG2RAD, 0, 0], // Slumped
    chest: [20 * DEG2RAD, 0, 0],
    neck: [30 * DEG2RAD, 0, 0], // Head down
    head: [20 * DEG2RAD, 0, 0],
    shoulderL: [0, 0, 0],
    armUpperL: [0, 0, 20 * DEG2RAD], // Arms hanging
    armLowerL: [0, 0, 0],
    handL: [0, 0, 0],
    shoulderR: [0, 0, 0],
    armUpperR: [0, 0, -20 * DEG2RAD],
    armLowerR: [0, 0, 0],
    handR: [0, 0, 0],
    legUpperL: [-90 * DEG2RAD, 20 * DEG2RAD, 0], // Kneeling
    legLowerL: [90 * DEG2RAD, 0, 0],
    footL: [0, 0, 0],
    legUpperR: [-90 * DEG2RAD, -20 * DEG2RAD, 0],
    legLowerR: [90 * DEG2RAD, 0, 0],
    footR: [0, 0, 0],
  },
};
