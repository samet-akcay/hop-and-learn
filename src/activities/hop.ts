export interface HopPose { x: number; y: number; scaleX: number; scaleY: number }

export function hopPose(fromX: number, toX: number, progress: number, lift = 44): HopPose {
  const t = Math.max(0, Math.min(1, progress));
  const arc = t === 0 || t === 1 ? 0 : Math.sin(Math.PI * t);
  return {
    x: fromX + (toX - fromX) * t,
    y: arc === 0 ? 0 : -arc * lift,
    scaleX: 1 + arc * 0.08,
    scaleY: 1 - arc * 0.08,
  };
}
