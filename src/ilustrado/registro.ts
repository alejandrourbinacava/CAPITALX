import type { Decorado } from "./tipos";
import { DECORADOS_WEI } from "./wei";
import { DECORADOS_CRK } from "./crk";
import { DECORADOS_POT } from "./pot";
import { DECORADOS_VOC } from "./voc";

/** Todos los decorados, por "<codigo>/<nombre>". */
export const DECORADOS: Record<string, Decorado> = {
  ...DECORADOS_WEI,
  ...DECORADOS_CRK,
  ...DECORADOS_POT,
  ...DECORADOS_VOC,
};
