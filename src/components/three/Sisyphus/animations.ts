import {
  AnimationClip,
  QuaternionKeyframeTrack,
  Quaternion,
  Euler,
  KeyframeTrack,
} from 'three';
import { POSES, PoseData, BoneName } from './poses';

const DEG2RAD = Math.PI / 180;

function getQuaternion(x: number, y: number, z: number): Quaternion {
  return new Quaternion().setFromEuler(new Euler(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD));
}

function createBoneTrack(
  boneName: string,
  times: number[],
  rotations: [number, number, number][]
): QuaternionKeyframeTrack {
  const values: number[] = [];
  rotations.forEach((rot) => {
    const qFromRad = new Quaternion().setFromEuler(new Euler(rot[0], rot[1], rot[2]));
    values.push(qFromRad.x, qFromRad.y, qFromRad.z, qFromRad.w);
  });

  return new QuaternionKeyframeTrack(`${boneName}.quaternion`, times, values);
}

export const ANIMATIONS = {
  PUSH_CYCLE: 'push_cycle',
  SUMMIT_REACH: 'summit_reach',
  WATCH_FALL: 'watch_fall',
  DESPAIR: 'despair',
  RISE_AGAIN: 'rise_again',
  IDLE: 'idle',
};

export function createSisyphusAnimations(): AnimationClip[] {
  const clips: AnimationClip[] = [];

  const pushBase = POSES.pushing;
  const pushTracks: KeyframeTrack[] = [];
  const pushDuration = 1.2;
  const times = [0, pushDuration * 0.25, pushDuration * 0.5, pushDuration * 0.75, pushDuration];

  const bones: BoneName[] = [
    'hips', 'spine', 'chest', 'neck', 'head',
    'shoulderL', 'armUpperL', 'armLowerL', 'handL',
    'shoulderR', 'armUpperR', 'armLowerR', 'handR',
    'legUpperL', 'legLowerL', 'footL',
    'legUpperR', 'legLowerR', 'footR'
  ];

  bones.forEach(bone => {
    const baseRot = pushBase[bone];
    const rotations: [number, number, number][] = [];
    
    for (let i = 0; i < times.length; i++) {
      let rot = [...baseRot] as [number, number, number];
      const t = i / (times.length - 1);
      
      if (bone === 'legUpperL') {
        rot[0] += Math.sin(t * Math.PI * 2) * 0.3;
      } else if (bone === 'legUpperR') {
        rot[0] += Math.sin(t * Math.PI * 2 + Math.PI) * 0.3;
      } else if (bone === 'legLowerL') {
        const sin = Math.sin(t * Math.PI * 2);
        rot[0] += sin > 0 ? sin * 0.4 : 0;
      } else if (bone === 'legLowerR') {
        const sin = Math.sin(t * Math.PI * 2 + Math.PI);
        rot[0] += sin > 0 ? sin * 0.4 : 0;
      } else if (bone === 'spine') {
        rot[0] += Math.abs(Math.sin(t * Math.PI * 2)) * 0.05;
      } else if (bone === 'armUpperL' || bone === 'armUpperR') {
        rot[0] += Math.sin(t * Math.PI * 4) * 0.05;
      }
      
      rotations.push(rot);
    }
    pushTracks.push(createBoneTrack(bone, times, rotations));
  });

  clips.push(new AnimationClip(ANIMATIONS.PUSH_CYCLE, pushDuration, pushTracks));

  const summitDuration = 2.0;
  const summitTracks: KeyframeTrack[] = [];
  const summitTimes = [0, summitDuration];
  
  const summitPose: PoseData = {
    ...POSES.standing,
    armUpperL: [0, 0, 130 * DEG2RAD],
    armUpperR: [0, 0, -130 * DEG2RAD],
    armLowerL: [0, 0, 0],
    armLowerR: [0, 0, 0],
    head: [-30 * DEG2RAD, 0, 0],
    chest: [-10 * DEG2RAD, 0, 0],
  };

  bones.forEach(bone => {
    summitTracks.push(createBoneTrack(bone, summitTimes, [POSES.pushing[bone], summitPose[bone]]));
  });
  clips.push(new AnimationClip(ANIMATIONS.SUMMIT_REACH, summitDuration, summitTracks));

  const watchDuration = 2.0;
  const watchTracks: KeyframeTrack[] = [];
  const watchTimes = [0, watchDuration];
  
  const watchPose: PoseData = {
    ...POSES.standing,
    hips: [0, 40 * DEG2RAD, 0],
    spine: [0, 20 * DEG2RAD, 0],
    head: [20 * DEG2RAD, 0, 0],
    armUpperL: [0, 0, 40 * DEG2RAD],
    armUpperR: [0, 0, -40 * DEG2RAD],
  };

  bones.forEach(bone => {
    watchTracks.push(createBoneTrack(bone, watchTimes, [summitPose[bone], watchPose[bone]]));
  });
  clips.push(new AnimationClip(ANIMATIONS.WATCH_FALL, watchDuration, watchTracks));

  const despairDuration = 2.0;
  const despairTracks: KeyframeTrack[] = [];
  const despairTimes = [0, despairDuration];
  
  bones.forEach(bone => {
    despairTracks.push(createBoneTrack(bone, despairTimes, [watchPose[bone], POSES.despair[bone]]));
  });
  clips.push(new AnimationClip(ANIMATIONS.DESPAIR, despairDuration, despairTracks));

  const riseDuration = 3.0;
  const riseTracks: KeyframeTrack[] = [];
  const riseTimes = [0, riseDuration];
  
  bones.forEach(bone => {
    riseTracks.push(createBoneTrack(bone, riseTimes, [POSES.despair[bone], POSES.pushing[bone]]));
  });
  clips.push(new AnimationClip(ANIMATIONS.RISE_AGAIN, riseDuration, riseTracks));

  const idleDuration = 1.0;
  const idleTracks: KeyframeTrack[] = [];
  bones.forEach(bone => {
    idleTracks.push(createBoneTrack(bone, [0, 1], [POSES.standing[bone], POSES.standing[bone]]));
  });
  clips.push(new AnimationClip(ANIMATIONS.IDLE, idleDuration, idleTracks));

  return clips;
}