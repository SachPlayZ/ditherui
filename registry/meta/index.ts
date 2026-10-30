import asciiRain from "./ascii-rain.ts";
import button from "./button.ts";
import toggle from "./toggle.ts";
import loader from "./loader.ts";
import skeleton from "./skeleton.ts";
import backdrop from "./backdrop.ts";
import card from "./card.ts";
import terminal from "./terminal.ts";
import asciiChart from "./ascii-chart.ts";
import heroTerminal from "./hero-terminal.ts";
import asciiVideo from "./ascii-video.ts";
import ditherField from "./dither-field.ts";
import ditherImage from "./dither-image.ts";
import ditherReveal from "./dither-reveal.ts";
import ditherProgress from "./dither-progress.ts";
import scrambleText from "./scramble-text.ts";
import type { ComponentMeta } from "./types.ts";

export const components: ComponentMeta[] = [ditherField, ditherImage, ditherProgress, asciiVideo, scrambleText, ditherReveal, asciiRain, button, toggle, loader, skeleton, card, backdrop, terminal, asciiChart, heroTerminal];
