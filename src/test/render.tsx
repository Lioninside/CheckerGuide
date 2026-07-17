import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { HashRouter } from "react-router-dom";
import { vi } from "vitest";

import { CatalogProvider } from "../contexts/CatalogContext";
import { ProfileProvider } from "../contexts/ProfileContext";
import { sampleCatalog } from "./fixtures";

export function renderWithProfile(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: ProfileRouterWrapper, ...options });
}

export function renderWithAppProviders(ui: ReactElement, options?: RenderOptions) {
  mockCatalogFetch();
  return render(ui, { wrapper: FullWrapper, ...options });
}

export function mockCatalogFetch() {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(sampleCatalog), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      ),
    ),
  );
}

function ProfileRouterWrapper({ children }: { children: ReactNode }) {
  return (
    <HashRouter>
      <ProfileProvider>{children}</ProfileProvider>
    </HashRouter>
  );
}

function FullWrapper({ children }: { children: ReactNode }) {
  return (
    <CatalogProvider>
      <ProfileProvider>
        <HashRouter>{children}</HashRouter>
      </ProfileProvider>
    </CatalogProvider>
  );
}
