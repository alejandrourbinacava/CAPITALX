import type { Decorado } from "../tipos";
import { BOLSA } from "./bolsa";
import { PARQUE } from "./parque";
import { OFICINA, SALON } from "./interiores";
import { FABRICA, GRANJA, PUERTO } from "./trabajo";
import { BANCO, COMEDOR, FLORIDA, HOOVERVILLE } from "./calles";
import { EUROPA } from "./europa";
import { CONSEJO, MODERNO, ROOSEVELT, VENTANILLA } from "./poder";
import { AVISO, BILLETE, CERTIFICADO, CINTA, PERIODICO } from "./insertos";

/** Decorados del video "crk". Clave: "crk/<nombre>". */
export const DECORADOS_CRK: Record<string, Decorado> = {
  "crk/bolsa": BOLSA,
  "crk/parque": PARQUE,
  "crk/oficina": OFICINA,
  "crk/salon": SALON,
  "crk/fabrica": FABRICA,
  "crk/granja": GRANJA,
  "crk/puerto": PUERTO,
  "crk/banco": BANCO,
  "crk/comedor": COMEDOR,
  "crk/hooverville": HOOVERVILLE,
  "crk/florida": FLORIDA,
  "crk/europa": EUROPA,
  "crk/consejo": CONSEJO,
  "crk/ventanilla": VENTANILLA,
  "crk/roosevelt": ROOSEVELT,
  "crk/moderno": MODERNO,
  "crk/cinta": CINTA,
  "crk/certificado": CERTIFICADO,
  "crk/periodico": PERIODICO,
  "crk/billete": BILLETE,
  "crk/aviso": AVISO,
};
