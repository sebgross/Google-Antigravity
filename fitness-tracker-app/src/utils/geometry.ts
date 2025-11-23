import type { Results } from '@mediapipe/pose';

export interface Point {
    x: number;
    y: number;
}

export function calculateAngle(a: Point, b: Point, c: Point): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);

    if (angle > 180.0) {
        angle = 360 - angle;
    }

    return angle;
}

export function getLandmark(results: Results, index: number): Point | null {
    if (!results.poseLandmarks || !results.poseLandmarks[index]) {
        return null;
    }
    return results.poseLandmarks[index];
}
