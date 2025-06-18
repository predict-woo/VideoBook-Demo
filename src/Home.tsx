import { Player } from "@remotion/player";
import { useMemo, useState } from "react";
import {
  DURATION_IN_FRAMES,
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
} from "../app/remotion/constants.mjs";
import "./app.css";
import { z } from "zod";
import { Main } from "../app/remotion/components/Main";
import { Template } from "../app/remotion/components/Template";
import { RenderControls } from "./components/RenderControls";
import { Spacing } from "./components/Spacing";
import { Tips } from "./components/Tips";
import { CompositionProps } from "../app/remotion/schemata";

export function Home() {
  const [text, setText] = useState("Remotion Player");

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      srtUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    };
  }, [text]);

  return (
    <div>
      <div className="max-w-screen-md m-auto mb-5">
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16 flex justify-center bg-black/50">
          <Player
            component={Template}
            inputProps={{
              title: "문체는 곧 '정신의 얼굴'이에요",
              videoUrl: "/test-video/tom.mp4",
              srtUrl: "/test-video/tom-rev-korean.srt",
            }}
            durationInFrames={DURATION_IN_FRAMES}
            fps={COMPOSITION_FPS}
            compositionHeight={COMPOSITION_HEIGHT}
            compositionWidth={COMPOSITION_WIDTH}
            style={
              {
                // Can't use tailwind class for width since player's default styles take presedence over tailwind's,
                // but not over inline styles
                // width: "100%",
              }
            }
            controls
            loop
          />
        </div>
        <RenderControls
          text={text}
          setText={setText}
          inputProps={inputProps}
        ></RenderControls>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Tips></Tips>
      </div>
    </div>
  );
}
