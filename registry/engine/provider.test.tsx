// @vitest-environment jsdom
import { act, cleanup, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { DitherProvider, useColorScheme, useDitherTokens, type DitherProviderProps } from "./provider";
import { Quantize } from "./quantize";

let prefersDark = false;
const listeners = new Set<() => void>();

beforeEach(() => {
  prefersDark = false;
  document.documentElement.className = "";
  delete document.documentElement.dataset.theme;
  globalThis.matchMedia = ((query: string) => ({
    get matches() {
      return query.includes("dark") && prefersDark;
    },
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  })) as unknown as typeof matchMedia;
});
afterEach(cleanup);

const wrap = (props: DitherProviderProps) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <DitherProvider {...props}>{children}</DitherProvider>;
  };

describe("useDitherTokens", () => {
  it("merges defaults, then provider, then props", () => {
    const { result } = renderHook(() => useDitherTokens({ pattern: "bayer8", speed: undefined }), {
      wrapper: wrap({ palette: "amber", pattern: "bayer2", speed: 2 }),
    });
    expect(result.current).toMatchObject({ mode: "dither", palette: "amber", pattern: "bayer8", speed: 2, cell: 3 });
  });

  it("lets nested providers inherit and override", () => {
    const outer = wrap({ palette: "cga", contrast: 2 });
    const { result } = renderHook(() => useDitherTokens({}), {
      wrapper: ({ children }) => outer({ children: <DitherProvider contrast={3}>{children}</DitherProvider> }),
    });
    expect(result.current).toMatchObject({ palette: "cga", contrast: 3 });
  });

  it("defaults cell to 10 in ascii mode unless set", () => {
    expect(renderHook(() => useDitherTokens({ mode: "ascii" })).result.current.cell).toBe(10);
    expect(renderHook(() => useDitherTokens({ mode: "ascii", cell: 6 })).result.current.cell).toBe(6);
    const { result } = renderHook(() => useDitherTokens({ mode: "ascii" }), { wrapper: wrap({ cell: 4 }) });
    expect(result.current.cell).toBe(4);
  });
});

describe("useColorScheme", () => {
  const scheme = (props: DitherProviderProps = {}) => renderHook(() => useColorScheme().scheme, { wrapper: wrap(props) });

  it("honours an explicit scheme", () => {
    prefersDark = true;
    expect(scheme({ colorScheme: "light" }).result.current).toBe("light");
    expect(scheme({ colorScheme: "dark" }).result.current).toBe("dark");
  });

  it("system follows the OS setting live", () => {
    const { result } = scheme();
    expect(result.current).toBe("light");
    act(() => {
      prefersDark = true;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe("dark");
  });

  it("system follows a dark class or data-theme on <html> over the OS setting", async () => {
    prefersDark = true;
    const { result } = scheme();
    await act(async () => void document.documentElement.classList.add("light"));
    expect(result.current).toBe("light");
    await act(async () => {
      document.documentElement.className = "";
      document.documentElement.dataset.theme = "dark";
    });
    expect(result.current).toBe("dark");
  });
});

describe("Quantize SSR", () => {
  const source = { kind: "field", field: "noise" } as const;

  it("paints palette[0] as the background", () => {
    expect(renderToString(<Quantize source={source} palette="gameboy" />)).toContain("background:#0f380f");
    expect(renderToString(<Quantize source={source} palette="ink" />)).toMatch(/background:light-dark\(#f2f0e9, #0a0a0a\)/);
    expect(
      renderToString(
        <DitherProvider colorScheme="light">
          <Quantize source={source} />
        </DitherProvider>,
      ),
    ).toContain("background:#f2f0e9");
  });

  it("throws a clear error for an invalid palette", () => {
    expect(() => render(<Quantize source={source} palette={["#000"]} />)).toThrow(/2–4 colours/);
  });
});
