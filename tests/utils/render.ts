import {
  type RenderOptions,
  render as rtlRender,
} from "@testing-library/react";
import type { ReactElement } from "react";
import Wrapper from "./wrapper";

export const render = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
};
