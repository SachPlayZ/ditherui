// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Toggle } from "./toggle";

afterEach(cleanup);
const toggle = () => screen.getByRole("switch") as HTMLInputElement;

describe("Toggle", () => {
  it("is a native checkbox exposed as a switch, named by its label, with a decorative canvas", () => {
    const { container } = render(
      <label>
        Wi-Fi <Toggle />
      </label>,
    );
    expect(screen.getByRole("switch", { name: "Wi-Fi" }).tagName).toBe("INPUT");
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("toggles uncontrolled from defaultChecked", () => {
    render(<Toggle aria-label="Sound" defaultChecked />);
    expect(toggle().checked).toBe(true);
    fireEvent.click(toggle());
    expect(toggle().checked).toBe(false);
  });

  it("follows a controlled value", () => {
    const onChange = vi.fn();
    function Controlled() {
      const [on, setOn] = useState(false);
      return <Toggle aria-label="Dark" checked={on} onChange={(e) => (setOn(e.target.checked), onChange(e.target.checked))} />;
    }
    render(<Controlled />);
    fireEvent.click(toggle());
    expect(toggle().checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith(true);
    render(<Toggle aria-label="Fixed" checked={false} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("switch", { name: "Fixed" }));
    expect((screen.getByRole("switch", { name: "Fixed" }) as HTMLInputElement).checked).toBe(false);
  });

  it("submits with its form and respects disabled", () => {
    const { container } = render(
      <form>
        <Toggle aria-label="News" name="news" defaultChecked />
        <Toggle aria-label="Off" name="off" disabled />
      </form>,
    );
    const data = new FormData(container.querySelector("form")!);
    expect(data.get("news")).toBe("on");
    expect(data.has("off")).toBe(false);
    expect((screen.getByRole("switch", { name: "Off" }) as HTMLInputElement).disabled).toBe(true);
  });

  it("forwards ref, className and style", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<Toggle ref={ref} aria-label="X" className="t" style={{ margin: 4 }} />);
    expect(ref.current).toBe(toggle());
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("t");
    expect(root.style.margin).toBe("4px");
  });
});
