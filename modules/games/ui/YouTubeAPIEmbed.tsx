import { useRef, useEffect } from "react";
import { useGameVideo } from "@/modules/games/ui/GameContext";
import YouTube, { YouTubeProps } from 'react-youtube';
import { AspectRatio, Box } from "@radix-ui/themes";
import './youtube.css'

interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
}

interface YouTubeAPIEmbedProps {
    videoId: string;
}

export const YouTubeAPIEmbed = ({ videoId }: YouTubeAPIEmbedProps) => {

    const { startTime, endTime, } = useGameVideo();

    const playerRef = useRef<YT.Player | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | number | null>(null);
    const timeRef = useRef({ start: startTime, end: endTime });

    // Sync the mutable ref values immediately whenever context state shifts
    useEffect(() => {
        timeRef.current = { start: startTime, end: endTime };
    }, [startTime, endTime]);

    // Handle immediate manual seek changes if user updates numbers while paused
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(startTime, true);
        }
    }, [startTime]);

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            start: startTime, // Initial start time on the load
            controls: 1,
            rel: 0,
            autoplay: 1,
            end: endTime,
        },
    };

    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
        const player = event.target as YT.Player;

        playerRef.current = player;
        if (typeof player.playVideo === "function") {
            player.playVideo();
        }
    };

    //TODO Handle player pause state change correctly
    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        playerRef.current = event.target as YT.Player;

        if (event.data === window.YT.PlayerState.PLAYING) {
            startTracking();
        } else {
            stopTracking();
        }
    };

    function startTracking() {
        stopTracking(); // Kill duplicates

        intervalRef.current = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                const currentTime = playerRef.current.getCurrentTime();
                const { start, end } = timeRef.current; // Always reads the true updated numbers

                // CRITICAL FIX 2: Boundary cushion prevents skipping over the marker on high-res screens
                if (currentTime >= end - 0.1) {
                    playerRef.current.seekTo(start, true);
                }
            }
        }, 150); // Slightly faster polling rate (150ms) for tighter snap loops
    }

    function stopTracking() {
        if (intervalRef.current) {
            clearInterval(intervalRef.current as number);
            intervalRef.current = null;
        }
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current as number);
        };
    }, []);

    return (
        <div>
            <div style={{ width: '100%' }}>
            <Box className={"video-responsive-wrapper"}>
                {/* The native component wrapper */}
                <AspectRatio ratio={16 / 9}>
                    <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        containerClassName="video-container"
                        className="youtube-iframe"
                    />
                </AspectRatio>
            </Box>
            </div>
        </div>
    )
}