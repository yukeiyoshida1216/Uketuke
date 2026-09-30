import { preloadedPhotos } from "@/config/reception";

const retained: HTMLImageElement[] = [];

/** 画面を開く前に写真を展開し、参照を残して破棄されないようにする。 */
export function retainKioskPhotos() {
  if (typeof window === "undefined" || retained.length > 0) return;
  for (const src of preloadedPhotos) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    retained.push(img);
    if (typeof img.decode === "function") void img.decode().catch(() => undefined);
  }
}
