import { Player, PlayerRef } from "@remotion/player";
import {
  DURATION_IN_FRAMES,
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
} from "../app/remotion/constants.mjs";
import "./app.css";
import { Template } from "../app/remotion/components/Template";
import { TopBar } from "./components/TopBar";
import { useRef, useState, useLayoutEffect } from "react";
import { PlayerControls } from "./components/PlayerControls";

export function VideoBook() {
  const playerRef = useRef<PlayerRef>(null);
  const [playbackRate, setPlaybackRate] = useState(1.3);
  const appRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [compositionHeight, setCompositionHeight] =
    useState(COMPOSITION_HEIGHT);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (appRef.current) {
        const vh = window.innerHeight * 0.01;
        appRef.current.style.setProperty("--vh", `${vh}px`);
      }

      if (topBarRef.current && titleRef.current) {
        const topBarHeight = topBarRef.current.offsetHeight;
        const titleHeight = titleRef.current.offsetHeight;
        const newCompositionHeight =
          window.innerHeight - topBarHeight - titleHeight;
        setCompositionHeight(newCompositionHeight);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={appRef}
      style={{
        backgroundImage: "url(/bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "calc(var(--vh, 1vh) * 100)",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div ref={topBarRef}>
        <TopBar />
      </div>
      <div ref={titleRef} className="flex-none px-6 py-1 text-left">
        <h1 className="text-white font-bold text-[28px] leading-tight">
          '할 일'보다 '하지 않을 일'이 <br /> 성과를 결정한다
        </h1>
      </div>
      <Player
        ref={playerRef}
        component={Template}
        inputProps={{
          videoUrl: "/test-video/demo-compressed.mp4",
          srtUrl: "/test-video/demo-rev.srt",
          illustrationSrtUrl: "/test-video/demo-illustration.srt",
        }}
        durationInFrames={DURATION_IN_FRAMES}
        fps={COMPOSITION_FPS}
        compositionHeight={compositionHeight}
        compositionWidth={COMPOSITION_WIDTH}
        style={{
          width: "100%",
          flex: 1,
        }}
        loop
        playbackRate={playbackRate}
      />
      <PlayerControls
        playerRef={playerRef}
        durationInFrames={DURATION_IN_FRAMES}
        fps={COMPOSITION_FPS}
        playbackRate={playbackRate}
        setPlaybackRate={setPlaybackRate}
      />
    </div>
  );
}
