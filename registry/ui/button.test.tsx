// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

afterEach(cleanup);

describe("Button", () => {
  it("is a native button with its label as the accessible name and a decorative canvas", () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("type")).toBe("button");
    expect(container.querySelector("canvas")?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps disabled behaviour", () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("submits its form when type is submit", () => {
    const onSubmit = vi.fn((e: { preventDefault(): void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("is focusable and forwards ref, className, style and pointer handlers", () => {
    const ref = createRef<HTMLButtonElement>();
    const onPointerEnter = vi.fn();
    render(<Button ref={ref} className="cta" style={{ width: 200 }} onPointerEnter={onPointerEnter}>Go</Button>);
    const button = screen.getByRole("button", { name: "Go" });
    expect(ref.current).toBe(button);
    expect(button.className).toBe("cta");
    expect(button.style.width).toBe("200px");
    button.focus();
    expect(document.activeElement).toBe(button);
    fireEvent.pointerEnter(button);
    expect(onPointerEnter).toHaveBeenCalledOnce();
  });
});
