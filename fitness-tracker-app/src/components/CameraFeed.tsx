import { forwardRef } from 'react';
import Webcam from 'react-webcam';

interface CameraFeedProps {
    onUserMedia?: () => void;
}

const CameraFeed = forwardRef<Webcam, CameraFeedProps>(({ onUserMedia }, ref) => {
    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <Webcam
            ref={ref}
            audio={false}
            width="100%"
            height="100%"
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
            className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />
    );
});

CameraFeed.displayName = 'CameraFeed';

export default CameraFeed;
