import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmptyState } from "./EmptyState";
import { EpisodeCard } from "./EpisodeCard";
import { FilterBar } from "./FilterBar";
import { ImportDialog } from "./ImportDialog";
import { LocalProfileNotice } from "./LocalProfileNotice";
import { ProfileStats } from "./ProfileStats";
import { ResetDialog } from "./ResetDialog";
import { sampleEpisodes } from "../test/fixtures";
import { renderWithAppProviders, renderWithProfile } from "../test/render";
import { createProfile, markEpisodeSeen, toggleBookmark } from "../domain/profile";

describe("components", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("rendert EpisodeCard mit Status und Aktionen", async () => {
    renderWithProfile(<EpisodeCard episode={sampleEpisodes[0]!} />);

    expect(screen.getByText("Checker Tobi: Der Käse-Check")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Merken/ }));
    expect(screen.getByRole("button", { name: /Gemerkt/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Als gesehen markieren/ }));
    expect(screen.getByText("Gesehen")).toBeInTheDocument();
  });

  it("aktualisiert Filter sofort", async () => {
    const onChange = vi.fn();
    renderWithProfile(
      <FilterBar
        filters={{ query: "", checker: "", topic: "" }}
        checkers={["Tobi"]}
        topics={["Essen"]}
        onChange={onChange}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText("Titel oder Thema"), "Käse");
    fireEvent.change(screen.getByLabelText("Checker"), { target: { value: "Tobi" } });

    expect(onChange).toHaveBeenCalled();
  });

  it("zeigt Profilkennzahlen", () => {
    let profile = createProfile();
    profile = markEpisodeSeen(profile, "episode-kaese");
    profile = toggleBookmark(profile, "episode-wald");

    renderWithProfile(<ProfileStats profile={profile} episodes={sampleEpisodes} />);

    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("Lieblingschecker")).toBeInTheDocument();
  });

  it("bestaetigt den lokalen Speicherhinweis", async () => {
    renderWithProfile(<LocalProfileNotice />);

    expect(screen.getByText(/Profil bleibt nur in diesem Browser/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Verstanden" }));
    expect(screen.queryByText(/Profil bleibt nur in diesem Browser/)).not.toBeInTheDocument();
  });

  it("zeigt leere und Fehlerzustaende mit Aktion", async () => {
    const onAction = vi.fn();
    renderWithProfile(
      <EmptyState
        title="Keine Suchtreffer"
        body="Passe Suche oder Filter an."
        actionLabel="Erneut"
        onAction={onAction}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /Erneut/ }));
    expect(onAction).toHaveBeenCalled();
  });

  it("validiert Importdateien und bietet Merge und Replace", async () => {
    const onClose = vi.fn();
    const { container } = renderWithAppProviders(<ImportDialog open onClose={onClose} />);
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(
      [JSON.stringify({ version: 1, seenEpisodeIds: ["episode-kaese"], bookmarkedEpisodeIds: [] })],
      "profil.json",
      { type: "application/json" },
    );

    await waitFor(() => expect(screen.getByText("Profil importieren")).toBeInTheDocument());
    await userEvent.upload(fileInput as HTMLInputElement, file);

    expect(await screen.findByText(/1 gesehene Folgen/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Zusammenführen/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("setzt das Profil über den Resetdialog zurück", async () => {
    const onClose = vi.fn();
    renderWithProfile(<ResetDialog open onClose={onClose} />);

    await userEvent.click(screen.getByRole("button", { name: /Zurücksetzen/ }));
    expect(onClose).toHaveBeenCalled();
  });
});
