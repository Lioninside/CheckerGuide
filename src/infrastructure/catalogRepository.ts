import { parseCatalog, type Catalog } from "../domain/catalog";

export async function loadCatalog(baseUrl = import.meta.env.BASE_URL): Promise<Catalog> {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const response = await fetch(`${normalizedBase}catalog/episodes.json`, {
    cache: "force-cache",
  });

  if (!response.ok) {
    throw new Error("Katalog konnte nicht geladen werden.");
  }

  const json = (await response.json()) as unknown;
  return parseCatalog(json);
}
