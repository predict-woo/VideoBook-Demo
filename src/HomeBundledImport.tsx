import { Player } from "@remotion/player";
import { useMemo, useState } from "react";
import {
  DURATION_IN_FRAMES,
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
} from "../app/remotion/constants.mjs";
import "./app.css";
import { RenderControls } from "./components/RenderControls";
import { Spacing } from "./components/Spacing";
import { Tips } from "./components/Tips";

// Import the bundled file
// @ts-ignore
import * as RemotionMain from "../dist/remotion-main.umd.js";

export function HomeBundledImport() {
  const [text, setText] = useState("Remotion Player (Direct Import)");

  const inputProps = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  // Access the Main component from the bundle
  const MainComponent = RemotionMain.Main || (window as any).RemotionMain?.Main;

  if (!MainComponent) {
    return <div>Error loading bundled component</div>;
  }

  return (
    <div>
      <div className="max-w-screen-md m-auto mb-5">
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
          <Player
            component={MainComponent}
            inputProps={inputProps}
            durationInFrames={DURATION_IN_FRAMES}
            fps={COMPOSITION_FPS}
            compositionHeight={COMPOSITION_HEIGHT}
            compositionWidth={COMPOSITION_WIDTH}
            style={{
              width: "100%",
            }}
            controls
            autoPlay
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