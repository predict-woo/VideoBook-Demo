import { Player } from "@remotion/player";
import { useMemo, useState, useEffect } from "react";
import {
  DURATION_IN_FRAMES,
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
} from "../app/remotion/constants.mjs";
import "./app.css";
import { z } from "zod";
import { RenderControls } from "./components/RenderControls";
import { Spacing } from "./components/Spacing";
import { Tips } from "./components/Tips";

// Define the types for the bundled module
interface RemotionMainModule {
  Main: React.ComponentType<{ title: string }>;
  CompositionProps: z.ZodObject<any>;
}

declare global {
  interface Window {
    RemotionMain: RemotionMainModule;
  }
}

export function HomeBundled() {
  const [text, setText] = useState("Remotion Player (Bundled)");
  const [MainComponent, setMainComponent] = useState<React.ComponentType<{ title: string }> | null>(null);
  const [CompositionProps, setCompositionProps] = useState<z.ZodObject<any> | null>(null);

  useEffect(() => {
    // Load the bundled script
    const script = document.createElement("script");
    script.src = `/remotion-main.umd.js?t=${Date.now()}`;
    script.onload = () => {
      console.log("Script loaded, window.RemotionMain:", window.RemotionMain);
      console.log("Window keys:", Object.keys(window).filter(k => k.includes('motion')));
      if (window.RemotionMain) {
        console.log("RemotionMain keys:", Object.keys(window.RemotionMain));
        console.log("RemotionMain.Main:", window.RemotionMain.Main);
        console.log("RemotionMain.CompositionProps:", window.RemotionMain.CompositionProps);
        
        if (window.RemotionMain.Main && window.RemotionMain.CompositionProps) {
          setMainComponent(() => window.RemotionMain.Main);
          setCompositionProps(window.RemotionMain.CompositionProps);
        } else {
          console.error("Main or CompositionProps not found in bundle");
        }
      }
    };
    script.onerror = (error) => {
      console.error("Failed to load script:", error);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const inputProps = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  if (!MainComponent || !CompositionProps) {
    console.log(MainComponent)
    console.log(CompositionProps)
    return <div>Loading bundled component...</div>;
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