import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "tests/utils/render";
import  App  from "@/routes/index";

describe("Appコンポーネントの小テスト", () => {
  it("Learn TanStackのリンクが表示されるか", () => {
    render(<App />);

    expect(screen.getByText("Learn TanStack"))
  });
});