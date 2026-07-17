import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WheelPage from "./WheelPage";
import { renderWithAppProviders } from "../test/render";

describe("WheelPage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("zeigt ein Glücksrad-Ergebnis", async () => {
    renderWithAppProviders(<WheelPage />);

    await waitFor(() => expect(screen.getByRole("button", { name: "Drehen" })).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Drehen" }));

    expect(await screen.findByText("Ergebnis")).toBeInTheDocument();
    expect(screen.getByText(/Auf YouTube ansehen/)).toBeInTheDocument();
  });
});
