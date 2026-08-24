import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadMono } from "@remotion/google-fonts/IBMPlexMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

export const archivo = loadArchivo("normal", { weights: ["400", "500", "600", "700"] });
export const mono = loadMono("normal", { weights: ["400", "500"] });
export const serif = loadSerif("normal", { weights: ["400"] });

export const FONT = {
  sans: archivo.fontFamily,
  mono: mono.fontFamily,
  serif: serif.fontFamily,
};

/** Paleta Capital X. El carmin es el unico color saturado del canal. */
export const C = {
  paper: "#F2EFE6",
  paperWarm: "#FBF9F2",
  ink: "#14181A",
  night: "#0A1210",
  carmin: "#C8402C",
  ocre: "#E8B33C",
  grid: "#CBD1C8",
  pale: "#9FC4B8",
  paleDim: "#4E7268",
  verde: "#2E5A4E",
  muted: "#6E7570",
  mutedNight: "#8FA79E",
};

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
};

/** Escala de tipos, en px sobre lienzo de 1920x1080. */
export const T = {
  kicker: 22,
  source: 20,
  rotuloKicker: 24,
  rotulo: 76,
  headline: 118,
  mega: 260,
  body: 40,
};

/** Duracion estimada de una linea de locucion, en fotogramas. */
export const framesForWords = (text: string, wpm = 145, fps = VIDEO.fps) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const seconds = (words / wpm) * 60;
  // margen de respiracion: pausa corta al final de cada frase
  return Math.max(Math.round((seconds + 0.45) * fps), Math.round(1.6 * fps));
};
