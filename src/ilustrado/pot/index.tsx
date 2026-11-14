import type { Decorado } from "../tipos";
import { CERRO, HOY } from "./cerro";
import { CAMINO, DESPEDIDA } from "./pueblo";
import { MINA } from "./mina";
import { PLAZA } from "./villa";
import { INGENIO, PATIO } from "./ingenio";
import { MONEDA } from "./moneda";
import { DESPACHO } from "./despacho";
import { FLOTA, MANILA, SEVILLA } from "./mar";
import { CHINA, MERCADO } from "./otros";
import { DOCUMENTO, LIBRO, LINGOTE, MAPA, MONEDA8 } from "./insertos";
import { HALLAZGO } from "./hallazgo";

/** Decorados del video "pot". Clave: "pot/<nombre>". */
export const DECORADOS_POT: Record<string, Decorado> = {
  "pot/cerro": CERRO,
  "pot/hallazgo": HALLAZGO,
  "pot/hoy": HOY,
  "pot/despedida": DESPEDIDA,
  "pot/camino": CAMINO,
  "pot/mina": MINA,
  "pot/plaza": PLAZA,
  "pot/ingenio": INGENIO,
  "pot/patio": PATIO,
  "pot/moneda": MONEDA,
  "pot/despacho": DESPACHO,
  "pot/flota": FLOTA,
  "pot/sevilla": SEVILLA,
  "pot/manila": MANILA,
  "pot/china": CHINA,
  "pot/mercado": MERCADO,
  "pot/moneda8": MONEDA8,
  "pot/lingote": LINGOTE,
  "pot/mapa": MAPA,
  "pot/libro": LIBRO,
  "pot/documento": DOCUMENTO,
};
