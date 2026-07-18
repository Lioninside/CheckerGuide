export function openExternalUrl(url: string): void {
  globalThis.open?.(url, "_blank", "noopener,noreferrer");
}

export function downloadJsonFile(contents: string, fileName: string): void {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
