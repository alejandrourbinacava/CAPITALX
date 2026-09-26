import type { Guion } from "./Video";
import { PLANTILLAS } from "./estilo";

/**
 * El muestrario de plantillas.
 *
 * Es el mismo material -misma cifra, mismo titular, mismo recorte, mismo
 * grafico- pasado por cada plantilla de edicion. Sirve para elegir antes de
 * escribir el guion y, sobre todo, para comprobar de un vistazo que una
 * plantilla nueva no rompe nada: si una cae a texto ilegible o se come el
 * rotulo, aqui se ve sin gastar un credito de voz ni renderizar once minutos.
 *
 * No lleva locucion a proposito, asi que las duraciones las estima el motor
 * por palabras y se puede renderizar sin tener los audios delante.
 */
const PLANOS = [
  {
    id: "d-01",
    vo:
      "A los Países Bajos les faltan cuatrocientas diez mil viviendas, y el agujero no se cierra: " +
      "hace un año eran cuatrocientas mil.",
    escenas: [
      {
        tipo: "contador",
        kicker: "VIVIENDAS QUE FALTAN",
        fuente: "Capital Value y ABF Research · 2026",
        de: { valor: 0, etiqueta: "" },
        a: { valor: 410000, etiqueta: "viviendas" },
      },
      {
        tipo: "recorte",
        recorte: {
          fichero: "recortes/blandhol.png",
          lado: "der",
          cifra: "4,8 %",
          titular: "De todo el parque de vivienda",
          apoyo: "Y subiendo: hace un año el agujero era de cuatrocientas mil casas.",
          icono: "casa",
        },
      },
      {
        tipo: "frase",
        texto: "No falta *espacio*. Falta permiso.",
      },
    ],
  },
  {
    id: "d-02",
    vo:
      "El cincuenta y cuatro por ciento del territorio es suelo agrícola y solo el trece por ciento " +
      "está construido: cuatro veces más campo que ciudad.",
    escenas: [
      {
        tipo: "barras",
        kicker: "CÓMO SE REPARTE EL SUELO",
        fuente: "Oficina Central de Estadística de los Países Bajos",
        barras: {
          unidad: "Por ciento del territorio",
          datos: [
            { etiqueta: "Suelo agrícola", valor: 54, tono: "carmin" },
            { etiqueta: "Construido", valor: 13, tono: "ink" },
          ],
        },
        rotulo: { kicker: "Cuatro veces más campo", texto: "que *ciudad*" },
      },
      {
        tipo: "objeto",
        objeto: "balanza",
        rotulo: { kicker: "El reparto del suelo", texto: "Cincuenta y cuatro contra *trece*" },
      },
      {
        tipo: "lista",
        lista: {
          titulo: "Lo que frena la obra",
          puntos: [
            "El permiso de nitrógeno, anulado en 2019",
            "Dieciocho mil proyectos congelados",
            "Trescientas mil casas sin red eléctrica",
          ],
        },
      },
    ],
  },
  {
    id: "d-03",
    vo:
      "Y el noventa y uno por ciento del amoníaco del país sale de la agricultura, no de las obras " +
      "que se pararon.",
    escenas: [
      {
        tipo: "gente",
        kicker: "QUIÉN EMITE DE VERDAD",
        fuente: "CBS · emisiones de amoníaco",
        gente: { total: 60, destacados: 55, escala: 0.8, etiqueta: "Emisiones", etiquetaDestacados: "Agricultura" },
      },
      {
        tipo: "recorte",
        recorte: {
          fichero: "recortes/rokke.png",
          lado: "izq",
          cifra: "91 %",
          titular: "Del amoníaco es agrícola",
          apoyo: "Se pararon dieciocho mil obras por un problema que las obras casi no causan.",
          icono: "aviso",
        },
      },
      {
        tipo: "frase",
        texto: "Se paró la *grúa*, no la granja.",
      },
    ],
  },
  {
    id: "d-04",
    vo:
      "Se terminaron sesenta y nueve mil doscientas casas cuando el objetivo eran cien mil, " +
      "y no es que falte terreno: es que el permiso se cortó de un día para otro y con él se " +
      "paró todo lo que venía detrás, dieciocho mil proyectos a la vez.",
    escenas: [
      {
        tipo: "ilustracion",
        kicker: "SEIS DE CADA DIEZ",
        fuente: "Capital Value y ABF Research · 2026",
        ilustracion: { nombre: "ciudad", total: 10, hechas: 6 },
        rotulo: { kicker: "El objetivo eran cien mil", texto: "Se hicieron *sesenta y nueve mil*" },
      },
      {
        tipo: "ilustracion",
        kicker: "EL PERMISO",
        ilustracion: { nombre: "flujo", cortado: true, de: "Licencias", a: "Obra" },
        rotulo: { kicker: "29 de mayo de 2019", texto: "El permiso *se corta*" },
      },
      {
        tipo: "ilustracion",
        kicker: "LO QUE VENÍA DETRÁS",
        ilustracion: { nombre: "fabrica", parado: true },
        rotulo: { kicker: "Dieciocho mil proyectos", texto: "Parados *a la vez*" },
      },
    ],
  },
] as any;

/** Un guion de muestra por plantilla, con el mismo material. */
export const DEMOS: { id: string; guion: Guion }[] = Object.keys(PLANTILLAS).map((nombre) => ({
  id: `estilo-${nombre}`,
  guion: {
    slug: `estilo-${nombre}`,
    wpm: 145,
    estilo: { plantilla: nombre },
    bloques: [{ planos: PLANOS }],
  } as Guion,
}));
