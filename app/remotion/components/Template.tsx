import React, {
  createRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
  Img,
  interpolate,
} from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/NotoSansKR";
import { SrtEntry, parseSrt } from "./utils/srt";

const { fontFamily } = loadFont("normal", {
  weights: ["700"],
});

export const templateSchema = z.object({
  videoUrl: z.string().url(),
  srtUrl: z.string().url(),
  illustrationSrtUrl: z.string().url(),
});

type TemplateSchema = z.infer<typeof templateSchema>;

const fetchSrt = async (url: string): Promise<SrtEntry[]> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch SRT file: ${res.statusText}`);
  }
  const text = await res.text();
  return parseSrt(text);
};

const SUBTITLE_FONT_SIZE = 20;
const LINE_HEIGHT = 1.7;

type SubtitlePosition = {
  top: number;
  height: number;
};

export const Template: React.FC<TemplateSchema> = ({
  videoUrl,
  srtUrl,
  illustrationSrtUrl,
}) => {
  const [srtEntries, setSrtEntries] = useState<SrtEntry[]>([]);
  const [illustrationEntries, setIllustrationEntries] = useState<SrtEntry[]>(
    [],
  );
  const [handle] = useState(() => delayRender("Fetching SRT files..."));
  const [subtitlePositions, setSubtitlePositions] = useState<
    SubtitlePosition[]
  >([]);
  const [subtitleContainerHeight, setSubtitleContainerHeight] = useState(0);

  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const currentTime = frame / fps;

  const subtitleContainerRef = createRef<HTMLDivElement>();

  useEffect(() => {
    const fetchAndParseSrt = async () => {
      try {
        const [entries, illustrations] = await Promise.all([
          fetchSrt(staticFile(srtUrl)),
          fetchSrt(staticFile(illustrationSrtUrl)),
        ]);
        setSrtEntries(entries);
        setIllustrationEntries(illustrations);
      } catch (error) {
        console.error("Failed to fetch or parse SRTs:", error);
      } finally {
        continueRender(handle);
      }
    };
    fetchAndParseSrt();
  }, [srtUrl, illustrationSrtUrl, handle]);

  const currentSrtIndex = useMemo(() => {
    let lastStartedIndex = -1;
    for (let i = 0; i < srtEntries.length; i++) {
      if (currentTime >= srtEntries[i].start) {
        lastStartedIndex = i;
      } else {
        break;
      }
    }
    return lastStartedIndex;
  }, [srtEntries, currentTime]);

  const currentIllustration = useMemo(() => {
    return illustrationEntries.find(
      (entry) => currentTime >= entry.start && currentTime <= entry.end,
    );
  }, [illustrationEntries, currentTime]);

  const subtitleRefs = useMemo(
    () =>
      Array(srtEntries.length)
        .fill(0)
        .map(() => createRef<HTMLDivElement>()),
    [srtEntries.length],
  );

  useLayoutEffect(() => {
    if (subtitleRefs.length > 0) {
      const positions = subtitleRefs.map((ref) => {
        if (ref.current) {
          return {
            top: ref.current.offsetTop,
            height: ref.current.clientHeight,
          };
        }
        return { top: 0, height: 0 };
      });

      if (JSON.stringify(positions) !== JSON.stringify(subtitlePositions)) {
        setSubtitlePositions(positions);
      }
    }
  }, [srtEntries, subtitleRefs, subtitlePositions, height]);

  useLayoutEffect(() => {
    if (subtitleContainerRef.current) {
      setSubtitleContainerHeight(subtitleContainerRef.current.clientHeight);
    }
  }, [subtitleContainerRef, height]);

  const targetScrollYs = useMemo(() => {
    if (
      subtitlePositions.length === 0 ||
      subtitleContainerHeight === 0 ||
      srtEntries.length !== subtitlePositions.length
    ) {
      return [];
    }
    return subtitlePositions.map((pos) => {
      const { top: subtitleTop, height: subtitleHeight } = pos;
      if (subtitleHeight === 0) {
        return 0; // Avoid NaNs for empty refs
      }
      return subtitleContainerHeight / 2 - subtitleTop - subtitleHeight / 2;
    });
  }, [subtitlePositions, subtitleContainerHeight, srtEntries.length]);

  const scrollY = useMemo(() => {
    if (currentSrtIndex === -1 || targetScrollYs.length === 0) {
      return 0;
    }

    return srtEntries
      .map((entry, i) => {
        if (i > currentSrtIndex || !targetScrollYs[i]) {
          return 0;
        }
        const startFrame = entry.start * fps;
        const from = i === 0 ? 0 : (targetScrollYs[i - 1] ?? 0);
        const to = targetScrollYs[i];
        const diff = to - from;

        return interpolate(
          spring({
            frame: frame - startFrame,
            fps,
            config: {
              damping: 100,
              stiffness: 100,
              mass: 1,
            },
          }),
          [0, 1],
          [0, diff],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
      })
      .reduce((a, b) => a + b, 0);
  }, [currentSrtIndex, targetScrollYs, srtEntries, fps, frame]);

  const videoSize = height * 0.4;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        className="flex flex-col"
        style={{ fontFamily, fontWeight: "bold" }}
      >
        {/* Video Section */}
        <div
          className="flex-none flex justify-center mt-2"
          style={{ height: videoSize }}
        >
          <div
            style={{
              position: "relative",
              width: videoSize,
              height: videoSize,
            }}
          >
            {currentIllustration && (
              <AbsoluteFill
                className="rounded-[10px] overflow-hidden shadow-2xl"
                style={{
                  // transform: `scale(${animatedIllustrationScale})`,
                  transformOrigin: "top right",
                }}
              >
                <Img
                  src={staticFile(currentIllustration.text)}
                  className="w-full h-full object-cover"
                />
              </AbsoluteFill>
            )}
            <AbsoluteFill
              style={
                {
                  // transform: `scale(${videoScale}) translateX(${videoTranslateX}px) translateY(${videoTranslateY}px)`,
                }
              }
            >
              <Video
                src={staticFile(videoUrl)}
                className="rounded-[10px] overflow-hidden shadow-2xl object-cover"
                style={{
                  width: "100%",
                  height: "100%",
                  maskImage:
                    "linear-gradient(to bottom, black 85%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 85%, transparent 100%)",
                }}
              />
            </AbsoluteFill>
          </div>
        </div>
        {/* Subtitle Scrolling Section */}
        <div
          ref={subtitleContainerRef}
          className="flex-1 px-6 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 90%, transparent 100%)",
          }}
        >
          <div
            className="w-full h-full flex flex-col justify-center"
            style={{
              transform: `translateY(${scrollY}px)`,
            }}
          >
            {srtEntries.map((entry, i) => {
              const isScrolledTo = i === currentSrtIndex;
              const isActive =
                currentTime >= entry.start && currentTime <= entry.end;
              const isRead = i < currentSrtIndex;
              const isFuture = i > currentSrtIndex;

              const lines = entry.text.split("\n");

              return (
                <div
                  key={entry.start}
                  ref={subtitleRefs[i]}
                  className="mb-5 text-left"
                >
                  {lines.map((line, lineIndex) => {
                    let pClassName = `px-1 rounded-[5px] transition-all duration-300 inline box-decoration-clone`;

                    if (isActive) {
                      pClassName += " text-white bg-white/30";
                    } else if (isRead || isScrolledTo) {
                      pClassName += " text-white bg-transparent";
                    } else if (isFuture) {
                      pClassName += " text-white/10 bg-transparent";
                    }

                    return (
                      <div
                        key={lineIndex}
                        className={
                          lines.length > 1 && lineIndex < lines.length - 1
                            ? "mb-2"
                            : ""
                        }
                      >
                        <p
                          className={pClassName}
                          style={{
                            fontSize: SUBTITLE_FONT_SIZE,
                            lineHeight: LINE_HEIGHT,
                            // For Safari and other browsers
                            boxDecorationBreak: "clone",
                            WebkitBoxDecorationBreak: "clone",
                          }}
                        >
                          {line}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
