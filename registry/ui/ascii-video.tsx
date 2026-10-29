"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref } from "react";
import { useDitherTokens } from "@/lib/dotgrain/provider";
import { Quantize } from "@/lib/dotgrain/quantize";
import type { DitherTokens } from "@/lib/dotgrain/types";

export type AsciiVideoProps = Partial<Omit<DitherTokens, "mode">> & {
  /** Video file or URL. Cross-origin videos need CORS headers and `crossOrigin`. */
  src?: string;
  /** Describes the video for screen readers; the ASCII canvas is announced as one image. */
  label: string;
  /** Offer a "Start camera" button; the webcam only starts when it is clicked. */
  webcam?: boolean;
  /** Intrinsic width; with `height` it reserves the aspect ratio. */
  width?: number;
  height?: number;
  crossOrigin?: "anonymous";
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
};

type Camera = "off" | "starting" | "on" | "denied" | "unavailable";

const hidden: CSSProperties = { position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" };
const fill: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
const overlay: CSSProperties = { position: "absolute", bottom: 8, left: 8, display: "flex", gap: 8, alignItems: "center", font: "12px/1.5 ui-monospace, monospace" };
// Readable over any palette without assuming the host's CSS.
const control: CSSProperties = { font: "inherit", color: "#fff", background: "rgb(0 0 0 / 0.7)", border: "1px solid rgb(255 255 255 / 0.5)", borderRadius: 4, padding: "2px 8px", cursor: "pointer" };
const message: CSSProperties = { ...control, cursor: undefined };

const motion = () => matchMedia("(prefers-reduced-motion: reduce)");
const subscribe = (cb: () => void) => (motion().addEventListener("change", cb), () => motion().removeEventListener("change", cb));

export function AsciiVideo({ src, label, webcam, width, height, crossOrigin, className, style, ref, ...tokens }: AsciiVideoProps) {
  // State re-renders once the element mounts (Quantize needs it); playback is driven through the ref.
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const element = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  // The viewer's play/pause choice; until they make one, play unless motion is reduced or speed is 0.
  const [choice, setChoice] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera>("off");
  const reduced = useSyncExternalStore(subscribe, () => motion().matches, () => false);
  // `speed` sets the playback rate.
  const { speed } = useDitherTokens({ ...tokens, mode: "ascii" });
  const playing = choice ?? !(reduced || speed <= 0);

  useEffect(() => {
    const v = element.current;
    if (!v) return;
    if (speed > 0) v.playbackRate = speed;
    if (playing) v.play().catch(() => setChoice(false));
    else v.pause();
  }, [video, speed, playing, src, camera]);

  useEffect(() => {
    // srcObject may also be a Blob or MediaSource, which have no tracks.
    const stream = element.current?.srcObject as Partial<MediaStream> | null | undefined;
    return () => stream?.getTracks?.().forEach((t) => t.stop());
  }, [video, camera]);

  async function startCamera() {
    const v = element.current;
    if (!v || !navigator.mediaDevices?.getUserMedia) return setCamera("unavailable");
    setCamera("starting");
    try {
      v.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
      setChoice(true);
      setCamera("on");
    } catch (error) {
      setCamera(error instanceof DOMException && error.name === "NotAllowedError" ? "denied" : "unavailable");
    }
  }

  const live = camera === "on";
  const showing = !!(src || live);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        aspectRatio: width && height ? `${width} / ${height}` : "16 / 9",
        maxWidth: width,
        // An empty screen until the camera starts.
        background: showing ? undefined : "rgb(127 127 127 / 0.15)",
        ...style,
      }}
    >
      {/* Rendered but invisible: browsers may not decode a display:none video's frames. */}
      <video
        ref={(v) => {
          element.current = v;
          setVideo(v);
        }}
        src={live ? undefined : src}
        crossOrigin={crossOrigin}
        muted
        loop
        playsInline
        aria-hidden={failed ? undefined : true}
        aria-label={failed ? label : undefined}
        style={failed ? fill : hidden}
      />
      {video && !failed && showing && (
        <Quantize
          source={{ kind: "video", element: video }}
          label={label}
          onError={() => setFailed(true)}
          {...tokens}
          mode="ascii"
          style={{ position: "absolute", inset: 0, transform: live ? "scaleX(-1)" : undefined }}
        />
      )}
      <div style={overlay}>
        {showing && (
          <button type="button" style={control} onClick={() => setChoice(!playing)}>
            {playing ? "Pause" : "Play"}
          </button>
        )}
        {webcam && !live && (
          <button type="button" style={control} onClick={startCamera} disabled={camera === "starting"}>
            Start camera
          </button>
        )}
        <span role="status" style={camera === "denied" || camera === "unavailable" ? message : undefined}>
          {camera === "denied" ? "Camera access was denied." : camera === "unavailable" ? "No camera available." : ""}
        </span>
      </div>
    </div>
  );
}
