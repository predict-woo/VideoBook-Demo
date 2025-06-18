import type { PlayerRef } from "@remotion/player";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { interpolate } from "remotion";

const PlayIcon: React.FC = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="currentColor" />
  </svg>
);

const PlayPauseButton: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
}> = ({ playerRef }) => {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const { current } = playerRef;
    if (!current) return;

    setPlaying(current.isPlaying());

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    current.addEventListener("play", onPlay);
    current.addEventListener("pause", onPause);

    return () => {
      current.removeEventListener("play", onPlay);
      current.removeEventListener("pause", onPause);
    };
  }, [playerRef]);

  const onToggle = useCallback(() => {
    playerRef.current?.toggle();
  }, [playerRef]);

  return (
    <button
      onClick={onToggle}
      type="button"
      className="flex items-center justify-center w-8 h-8 bg-black/50 rounded-full text-white mr-3 text-2xl"
    >
      {playing ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
};

const formatTime = (frame: number, fps: number): string => {
  const totalSeconds = frame / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  return `${minutesStr}:${secondsStr}`;
};

const TimeDisplay: React.FC<{
  playerRef: React.RefObject<PlayerRef | null>;
  fps: number;
}> = ({ playerRef, fps }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const { current } = playerRef;
    if (!current) return;

    const onTimeUpdate = () => {
      setFrame(current.getCurrentFrame());
    };

    current.addEventListener("frameupdate", onTimeUpdate);

    return () => {
      current.removeEventListener("frameupdate", onTimeUpdate);
    };
  }, [playerRef]);

  return (
    <div className="mr-4 font-pretendard text-[14px] font-semibold">
      <span>{formatTime(frame, fps)}</span>
    </div>
  );
};

const getFrameFromX = (
  clientX: number,
  durationInFrames: number,
  width: number,
) => {
  const pos = clientX;
  const frame = Math.round(
    interpolate(pos, [0, width], [0, Math.max(durationInFrames - 1, 0)], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return frame;
};

const SeekBar: React.FC<{
  durationInFrames: number;
  playerRef: React.RefObject<PlayerRef | null>;
}> = ({ durationInFrames, playerRef }) => {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [wasPlaying, setWasPlaying] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { current } = playerRef;
    if (!current) return;

    const onFrameUpdate = () => setFrame(current.getCurrentFrame());
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    current.addEventListener("frameupdate", onFrameUpdate);
    current.addEventListener("play", onPlay);
    current.addEventListener("pause", onPause);

    return () => {
      current.removeEventListener("frameupdate", onFrameUpdate);
      current.removeEventListener("play", onPlay);
      current.removeEventListener("pause", onPause);
    };
  }, [playerRef]);

  const seek = useCallback(
    (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
      if (!barRef.current || !playerRef.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newFrame = getFrameFromX(x, durationInFrames, rect.width);
      playerRef.current.seekTo(newFrame);
    },
    [durationInFrames, playerRef],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      setWasPlaying(playing);
      playerRef.current?.pause();
      setDragging(true);
      seek(e);
    },
    [playing, playerRef, seek],
  );

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (dragging) seek(e);
    };

    const onPointerUp = () => {
      if (dragging) {
        if (wasPlaying) {
          playerRef.current?.play();
        }
        setDragging(false);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragging, wasPlaying, playerRef, seek]);

  const progress = (frame / (durationInFrames - 1)) * 100;

  return (
    <div
      className="flex-grow h-1.5 mx-4 cursor-pointer"
      onPointerDown={onPointerDown}
      ref={barRef}
    >
      <div className="w-full h-full bg-white rounded-full">
        <div
          className="h-full bg-black rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const PlaybackRateButton: React.FC<{
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}> = ({ playbackRate, setPlaybackRate }) => {
  const rates = useMemo(() => [1, 1.3, 1.5, 2], []);

  const cycleRate = useCallback(() => {
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  }, [playbackRate, rates, setPlaybackRate]);

  return (
    <button onClick={cycleRate} className="text-[14px] font-semibold pr-3">
      x{playbackRate.toFixed(1)}
    </button>
  );
};

interface PlayerControlsProps {
  playerRef: React.RefObject<PlayerRef | null>;
  durationInFrames: number;
  fps: number;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  playerRef,
  durationInFrames,
  fps,
  playbackRate,
  setPlaybackRate,
}) => {
  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-lg h-12 rounded-full flex items-center p-2 text-white"
      style={{
        backgroundColor: "rgba(128, 128, 128, 0.5)",
        backdropFilter: "blur(10px)",
      }}
    >
      <PlayPauseButton playerRef={playerRef} />
      <TimeDisplay playerRef={playerRef} fps={fps} />
      <SeekBar playerRef={playerRef} durationInFrames={durationInFrames} />
      <PlaybackRateButton
        playbackRate={playbackRate}
        setPlaybackRate={setPlaybackRate}
      />
    </div>
  );
};
