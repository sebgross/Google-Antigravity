import type { Results } from '@mediapipe/pose';
import { calculateAngle, getLandmark } from '../utils/geometry';

export type ExerciseType = 'curl' | 'pushup' | 'pullup';

export interface ExerciseState {
    count: number;
    stage: 'UP' | 'DOWN' | null;
    feedback: string;
    progress: number; // 0-1 for current rep progress
}

interface ArmState {
    stage: 'UP' | 'DOWN' | null;
    angle: number;
}

export class ExerciseCounter {
    private type: ExerciseType;
    private count: number = 0;
    private lastFeedback: string = '';

    // Independent states for left/right limbs
    private leftArm: ArmState = { stage: null, angle: 0 };
    private rightArm: ArmState = { stage: null, angle: 0 };

    constructor(type: ExerciseType) {
        this.type = type;
    }

    private isBodyVisible(results: Results): boolean {
        const requiredLandmarks = [
            11, 12, // Shoulders
            13, 14, // Elbows
            15, 16, // Wrists
            23, 24, // Hips
            25, 26  // Knees (Added for "complete body" check)
        ];

        for (const index of requiredLandmarks) {
            const landmark = getLandmark(results, index);

            // Check if landmark exists
            if (!landmark) return false;

            // Check visibility confidence (MediaPipe default is usually 0.5 threshold, let's be stricter)
            if ((landmark.visibility ?? 0) < 0.65) return false;

            // Check if landmark is within frame bounds (0-1)
            // We allow a small margin of error (e.g., -0.05 to 1.05) to not be too annoying
            if (landmark.x < 0.01 || landmark.x > 0.99 || landmark.y < 0.01 || landmark.y > 0.99) {
                return false;
            }
        }

        return true;
    }

    public update(results: Results): ExerciseState {
        if (!this.isBodyVisible(results)) {
            return {
                count: this.count,
                stage: null,
                feedback: 'Please show full body (head to knees)',
                progress: 0
            };
        }

        switch (this.type) {
            case 'curl':
                return this.countCurls(results);
            case 'pushup':
                return this.countPushups(results);
            case 'pullup':
                return this.countPullups(results);
            default:
                return { count: this.count, stage: null, feedback: '', progress: 0 };
        }
    }

    public reset() {
        this.count = 0;
        this.lastFeedback = '';
        this.leftArm = { stage: null, angle: 0 };
        this.rightArm = { stage: null, angle: 0 };
        this.lastRepTime = 0;
    }

    private lastRepTime: number = 0;

    private countCurls(results: Results): ExerciseState {
        const leftShoulder = getLandmark(results, 11);
        const leftElbow = getLandmark(results, 13);
        const leftWrist = getLandmark(results, 15);

        const rightShoulder = getLandmark(results, 12);
        const rightElbow = getLandmark(results, 14);
        const rightWrist = getLandmark(results, 16);

        let feedback = this.lastFeedback;
        let activeProgress = 0;
        const now = Date.now();

        // Process Left Arm
        if (leftShoulder && leftElbow && leftWrist) {
            const angle = calculateAngle(leftShoulder, leftElbow, leftWrist);
            this.leftArm.angle = angle;

            if (angle > 165) { // Stricter extension
                this.leftArm.stage = 'DOWN';
            }
            if (angle < 45 && this.leftArm.stage === 'DOWN') { // Slightly easier flexion but requires full ROM
                this.leftArm.stage = 'UP';
                if (now - this.lastRepTime > 1000) { // 1s debounce to prevent double count
                    this.count++;
                    this.lastRepTime = now;
                    feedback = 'Good curl!';
                }
            }
            const progress = Math.max(0, Math.min(1, (165 - angle) / (165 - 45)));
            if (progress > activeProgress) activeProgress = progress;
        }

        // Process Right Arm
        if (rightShoulder && rightElbow && rightWrist) {
            const angle = calculateAngle(rightShoulder, rightElbow, rightWrist);
            this.rightArm.angle = angle;

            if (angle > 165) {
                this.rightArm.stage = 'DOWN';
            }
            if (angle < 45 && this.rightArm.stage === 'DOWN') {
                this.rightArm.stage = 'UP';
                if (now - this.lastRepTime > 1000) { // 1s debounce
                    this.count++;
                    this.lastRepTime = now;
                    feedback = 'Good curl!';
                }
            }
            const progress = Math.max(0, Math.min(1, (165 - angle) / (165 - 45)));
            if (progress > activeProgress) activeProgress = progress;
        }

        this.lastFeedback = feedback;
        return {
            count: this.count,
            stage: (this.leftArm.stage === 'UP' || this.rightArm.stage === 'UP') ? 'UP' : 'DOWN',
            feedback,
            progress: activeProgress
        };
    }

    private countPushups(results: Results): ExerciseState {
        // Using average of both arms for pushups to be more robust
        const leftShoulder = getLandmark(results, 11);
        const leftElbow = getLandmark(results, 13);
        const leftWrist = getLandmark(results, 15);

        const rightShoulder = getLandmark(results, 12);
        const rightElbow = getLandmark(results, 14);
        const rightWrist = getLandmark(results, 16);

        // Visibility check is now handled in update()

        const leftAngle = calculateAngle(leftShoulder!, leftElbow!, leftWrist!);
        const rightAngle = calculateAngle(rightShoulder!, rightElbow!, rightWrist!);

        const avgAngle = (leftAngle + rightAngle) / 2;

        if (avgAngle < 85) { // Stricter depth
            this.leftArm.stage = 'DOWN';
        }
        if (avgAngle > 165 && this.leftArm.stage === 'DOWN') { // Stricter lockout
            this.leftArm.stage = 'UP';
            this.count++;
            this.lastFeedback = 'Good pushup!';
        }

        const progress = Math.max(0, Math.min(1, (165 - avgAngle) / (165 - 85)));

        return { count: this.count, stage: this.leftArm.stage, feedback: this.lastFeedback, progress };
    }

    private countPullups(results: Results): ExerciseState {
        const leftShoulder = getLandmark(results, 11);
        const leftElbow = getLandmark(results, 13);
        const leftWrist = getLandmark(results, 15);

        // Visibility check is now handled in update()

        const angle = calculateAngle(leftShoulder!, leftElbow!, leftWrist!);

        if (angle > 160) {
            this.leftArm.stage = 'DOWN';
        }
        if (angle < 80 && this.leftArm.stage === 'DOWN') { // Slightly easier top position
            this.leftArm.stage = 'UP';
            this.count++;
            this.lastFeedback = 'Good pullup!';
        }

        const progress = Math.max(0, Math.min(1, (160 - angle) / (160 - 80)));

        return { count: this.count, stage: this.leftArm.stage, feedback: this.lastFeedback, progress };
    }
}
