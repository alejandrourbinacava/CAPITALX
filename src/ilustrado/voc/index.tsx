import type { Decorado } from "../tipos";
import { canal } from "./canal";
import { deudas, despacho, heeren, oficina } from "./interiores";
import { barco, cabo, puerto } from "./mar";
import { banda, perken } from "./asia";
import { batavia, dejima } from "./asia2";
import { almacen, bolsa } from "./bolsa";
import { carta, especias, libro, mapa, recibo } from "./insertos";
import { hoy, sala2026 } from "./hoy";

/** Decorados del video "voc". Clave: "voc/<nombre>". */
export const DECORADOS_VOC: Record<string, Decorado> = {
  "voc/canal": canal,
  "voc/oficina": oficina,
  "voc/heeren": heeren,
  "voc/despacho": despacho,
  "voc/deudas": deudas,
  "voc/puerto": puerto,
  "voc/barco": barco,
  "voc/cabo": cabo,
  "voc/banda": banda,
  "voc/perken": perken,
  "voc/batavia": batavia,
  "voc/dejima": dejima,
  "voc/bolsa": bolsa,
  "voc/almacen": almacen,
  "voc/recibo": recibo,
  "voc/libro": libro,
  "voc/carta": carta,
  "voc/especias": especias,
  "voc/mapa": mapa,
  "voc/hoy": hoy,
  "voc/sala2026": sala2026,
};
