// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AsciiVideo } from "./ascii-video";

let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;

const reducedMotion = (matches: boolean) =>
  vi.stubGlobal("matchMedia", (media: string) => ({ matches, media, addEventListener() {}, removeEventListener() {} }));

const camera = (getUserMedia?: () => Promise<unknown>) =>
  Object.defineProperty(navigator, "mediaDevices", { value: getUserMedia && { getUserMedia }, configurable: true });

beforeEach(() => {
  // jsdom doesn't implement media playback.
  play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue() as unknown as ReturnType<typeof vi.fn>;
  pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {}) as unknown as ReturnType<typeof vi.fn>;
  reducedMotion(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  camera(undefined);
});

describe("AsciiVideo", () => {
  it("announces the canvas by its label and keeps the video invisible but rendered", () => {
    const { container } = render(<AsciiVideo src="/clip.webm" label="Waves" />);
    expect(screen.getByRole("img", { name: "Waves" }).tagName).toBe("CANVAS");
    const video = container.querySelector("video")!;
    expect(video.getAttribute("aria-hidden")).toBe("true");
    expect(video.style.display).not.toBe("none");
    expect(video.style.opacity).toBe("0");
  });

  it("plays muted by default and toggles with a native button", () => {
    const { container } = render(<AsciiVideo src="/clip.webm" label="Waves" />);
    expect(container.querySelector("video")!.muted).toBe(true);
    expect(play).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(pause).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Play" })).toBeTruthy();
  });

  it("holds a still frame under reduced motion until the viewer presses Play", () => {
    reducedMotion(true);
    render(<AsciiVideo src="/clip.webm" label="Waves" />);
    expect(play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(play).toHaveBeenCalled();
  });

  it("holds a still frame with speed 0", () => {
    render(<AsciiVideo src="/clip.webm" label="Waves" speed={0} />);
    expect(play).not.toHaveBeenCalled();
  });

  it("starts the webcam only on click, mirrored, and stops it on unmount", async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] };
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    camera(getUserMedia);
    const { container, unmount } = render(<AsciiVideo webcam label="Webcam" />);
    expect(getUserMedia).not.toHaveBeenCalled();
    expect(container.querySelector("canvas")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Start camera" }));
    await screen.findByRole("img", { name: "Webcam" });
    expect(getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(container.querySelector("canvas")!.style.transform).toBe("scaleX(-1)");
    unmount();
    expect(stop).toHaveBeenCalled();
  });

  it("explains a denied or missing camera", async () => {
    camera(() => Promise.reject(new DOMException("no", "NotAllowedError")));
    render(<AsciiVideo webcam label="Webcam" />);
    fireEvent.click(screen.getByRole("button", { name: "Start camera" }));
    expect((await screen.findByText("Camera access was denied.")).getAttribute("role")).toBe("status");

    cleanup();
    camera(undefined);
    render(<AsciiVideo webcam label="Webcam" />);
    fireEvent.click(screen.getByRole("button", { name: "Start camera" }));
    expect(await screen.findByText("No camera available.")).toBeTruthy();
  });

  it("offers no camera button without `webcam`", () => {
    render(<AsciiVideo src="/clip.webm" label="Waves" />);
    expect(screen.queryByRole("button", { name: "Start camera" })).toBeNull();
  });
});
