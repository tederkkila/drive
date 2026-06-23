import React, { useRef, useEffect } from "react";
import { useGameVideo } from "./GameContext";
import YouTube, { YouTubeProps } from 'react-youtube';
import { AspectRatio, Box } from "@radix-ui/themes";
import './youtube.css'

declare global {
    interface Window {
        YT: typeof YT;
        onYouTubeIframeAPIReady?: () => void;
    }
}

interface YouTubeAPIEmbedProps {
    videoId: string;
}

export const YouTubeAPIEmbed = ({ videoId }: YouTubeAPIEmbedProps) => {

    const { startTime, endTime, seekTriggerCount, } = useGameVideo();

    const playerRef = useRef<any>(null);
    const intervalRef = useRef<NodeJS.Timeout | number | null>(null);
    const timeRef = useRef({ start: startTime, end: endTime });

    // Create a DOM reference to capture the video outer container element
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Sync the mutable ref values immediately whenever the context state shifts
    useEffect(() => {
        timeRef.current = { start: startTime, end: endTime };
    }, [startTime, endTime]);

    // Handle immediate manual seek changes if the user updates numbers while paused
    useEffect(() => {
        if (playerRef.current) {
            playerRef.current.seekTo(startTime, true);
        }
    }, [seekTriggerCount]);

    useEffect(() => {
        const handleOrientationChange = async () => {
            const orientation = window.screen.orientation?.type;
            const targetElement = containerRef.current;

            if (!targetElement) return;

            // 1. If rotated to landscape, request full-screen view
            if (orientation?.startsWith('landscape')) {
                if (document.fullscreenElement === null) {
                    try {
                        await targetElement.requestFullscreen();
                    } catch (err) {
                        console.error("Full-screen request failed:", err);
                    }
                }
            }
            // 2. If rotated back to portrait, exit full-screen view
            else if (orientation?.startsWith('portrait')) {
                if (document.fullscreenElement !== null) {
                    try {
                        await document.exitFullscreen();
                    } catch (err) {
                        console.error("Exit full-screen failed:", err);
                    }
                }
            }
        };

        // Attach listener if Screen Orientation API is available in browser
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', handleOrientationChange);
        }

        // Clean up event listener when component unmounts
        return () => {
            if (window.screen && window.screen.orientation) {
                window.screen.orientation.removeEventListener('change', handleOrientationChange);
            }
        };
    }, []);


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
        const player = event.target;

        playerRef.current = player;
        if (typeof player.playVideo === "function") {
            player.playVideo();
        }
    };

    const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
        playerRef.current = event.target;

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
        return () => stopTracking();
    }, []);

    return (
        <div>
            <div style={{ width: '100%' }}>
            <Box ref={containerRef} className={"video-responsive-wrapper"}>
                {/* The native component wrapper */}
                <AspectRatio ratio={16 / 9}>
                    <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={onPlayerReady}
                        onStateChange={onPlayerStateChange}
                        className="youtube-iframe"
                    />
                </AspectRatio>
            </Box>
            </div>
        </div>
    )
}