import type { Decorado } from "../tipos";
import { calle } from "./calle";
import { cambio, panaderia, ventanilla } from "./tiendas";
import { cocina, imprenta, salon } from "./interiores";
import { estacion, mercado, reichstag, ruhr } from "./exteriores";
import { cerveceria, conferencia, despacho } from "./salas";
import { casacambio, supermercado } from "./hoy";
import { billete, documento, libreta, periodico, sello } from "./insertos";

/** Decorados del video "wei" (Weimar, 1914-1924, y un epilogo en 2026). Clave: "wei/<nombre>". */
export const DECORADOS_WEI: Record<string, Decorado> = {
  "wei/calle": calle,
  "wei/panaderia": panaderia,
  "wei/cambio": cambio,
  "wei/ventanilla": ventanilla,
  "wei/imprenta": imprenta,
  "wei/cocina": cocina,
  "wei/salon": salon,
  "wei/ruhr": ruhr,
  "wei/estacion": estacion,
  "wei/reichstag": reichstag,
  "wei/mercado": mercado,
  "wei/conferencia": conferencia,
  "wei/despacho": despacho,
  "wei/cerveceria": cerveceria,
  "wei/supermercado": supermercado,
  "wei/casacambio": casacambio,
  "wei/billete": billete,
  "wei/periodico": periodico,
  "wei/libreta": libreta,
  "wei/sello": sello,
  "wei/documento": documento,
};
