/**
 * Genera src/data/mundo.json: las costas del mundo ya proyectadas, una vez por
 * "vista", para la escena `ruta`.
 *
 * Las costas son de Natural Earth (dominio publico, via world-atlas). Se
 * proyectan aqui y se guardan como trazado SVG en coordenadas del lienzo de
 * 1920x1080, igual que europa.json: dibujarlas en el render no cuesta nada.
 *
 * Uso (las librerias no son dependencias del proyecto; se instalan aparte):
 *   node scripts/mapamundi.mjs <carpeta con node_modules de d3-geo, topojson-client, world-atlas>
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const base = path.resolve(process.argv[2] ?? ".");
const require = createRequire(path.join(base, "x.js"));
const { geoMercator, geoNaturalEarth1, geoPath, geoGraticule10 } = require("d3-geo");
const { feature } = require("topojson-client");
const land50 = require(path.join(base, "node_modules/world-atlas/land-50m.json"));
const land110 = require(path.join(base, "node_modules/world-atlas/land-110m.json"));

const W = 1920;
const H = 1080;

/** [longitud, latitud]. Los lugares que salen en el guion, con su nombre en castellano. */
export const LUGARES = {
  Sevilla: [-5.99, 37.39], Cádiz: [-6.29, 36.53], Madrid: [-3.7, 40.42], Lisboa: [-9.14, 38.72],
  "Medina del Campo": [-4.91, 41.31], Toledo: [-4.02, 39.86], Almadén: [-4.83, 38.78], Barcelona: [2.17, 41.39],
  Génova: [8.93, 44.41], Piacenza: [9.69, 45.05], Besançon: [6.02, 47.24], Augsburgo: [10.9, 48.37],
  Fráncfort: [8.68, 50.11], Amberes: [4.4, 51.22], Ámsterdam: [4.9, 52.37], Londres: [-0.13, 51.51],
  Bruselas: [4.35, 50.85], Milán: [9.19, 45.46], Nápoles: [14.27, 40.85], Lepanto: [21.8, 38.37],
  "La Habana": [-82.37, 23.13], Cartagena: [-75.55, 10.4], Portobelo: [-79.66, 9.55], Panamá: [-79.52, 8.98],
  Veracruz: [-96.13, 19.18], "México": [-99.13, 19.43], Zacatecas: [-102.57, 22.77], Acapulco: [-99.9, 16.85],
  Callao: [-77.15, -12.05], Lima: [-77.04, -12.05], Potosí: [-65.75, -19.58], Huancavelica: [-74.97, -12.78],
  "Buenos Aires": [-58.38, -34.6], "San Juan": [-66.1, 18.47], "Santo Domingo": [-69.9, 18.48], "San Agustín": [-81.31, 29.89],
  Matanzas: [-81.58, 23.05], "Nombre de Dios": [-79.47, 9.58], Curazao: [-68.99, 12.17], Jamaica: [-77.3, 18.1],
  "San Juan de Ulúa": [-96.12, 19.21], Manila: [120.98, 14.6], Cebú: [123.89, 10.31], Cantón: [113.26, 23.13],
  Macao: [113.54, 22.2], Nankín: [118.8, 32.06], "Cabo Verde": [-23.5, 15.1], Luanda: [13.23, -8.84],
  Elmina: [-1.35, 5.08], Angola: [15, -11], Pekín: [116.4, 39.9], Malaca: [102.25, 2.19], Goa: [73.83, 15.5],
  Potosí_: [-65.75, -19.58],
};

/**
 * Cada vista: el trazado se encuadra sobre los puntos que se le dan, con margen.
 * `proy` elige la proyeccion; "rot" gira el globo (para centrar el Pacifico).
 */
const VISTAS = {
  mundo: {
    proy: "natural", rot: [-30, 0],
    puntos: [[-125, 52], [150, 52], [150, -40], [-125, -40]],
    margen: 60, fina: false, red: true,
  },
  atlantico: {
    proy: "mercator", rot: [0, 0],
    puntos: [[-100, 48], [30, 48], [-100, -28], [30, -28]],
    margen: 50, fina: true,
  },
  caribe: {
    proy: "mercator", rot: [0, 0],
    puntos: [[-100, 31], [-60, 31], [-100, 4], [-60, 4]],
    margen: 40, fina: true,
  },
  europa: {
    proy: "mercator", rot: [0, 0],
    puntos: [[-12, 54], [25, 54], [-12, 34], [25, 34]],
    margen: 40, fina: true,
  },
  pacifico: {
    proy: "mercator", rot: [-170, 0],
    puntos: [[100, 40], [-80, 40], [100, -2], [-80, -2]],
    margen: 40, fina: false,
  },
  andes: {
    proy: "mercator", rot: [0, 0],
    puntos: [[-82, 6], [-56, 6], [-82, -36], [-56, -36]],
    margen: 40, fina: true,
  },
};

const salida = {};
for (const [nombre, v] of Object.entries(VISTAS)) {
  const proj = (v.proy === "natural" ? geoNaturalEarth1() : geoMercator()).rotate(v.rot);
  const caja = { type: "MultiPoint", coordinates: v.puntos };
  proj.fitExtent([[v.margen, v.margen], [W - v.margen, H - v.margen]], caja);
  proj.clipExtent([[0, 0], [W, H]]);

  const camino = geoPath(proj).digits(1);
  const tierra = feature(v.fina ? land50 : land110, (v.fina ? land50 : land110).objects.land);
  const d = camino(tierra);

  const lugares = {};
  for (const [n, ll] of Object.entries(LUGARES)) {
    if (n.endsWith("_")) continue;
    const p = proj(ll);
    if (p && p[0] > 20 && p[0] < W - 20 && p[1] > 20 && p[1] < H - 20) lugares[n] = { x: Math.round(p[0]), y: Math.round(p[1]) };
  }
  const red = v.red ? geoPath(proj).digits(1)(geoGraticule10()) : null;
  salida[nombre] = { d, red, lugares };
  console.log(nombre.padEnd(10), (d.length / 1024).toFixed(0), "KB ·", Object.keys(lugares).length, "lugares");
}

const dest = path.resolve("src/data/mundo.json");
fs.writeFileSync(dest, JSON.stringify(salida));
console.log("escrito", dest, (fs.statSync(dest).size / 1024).toFixed(0), "KB");
