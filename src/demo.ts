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
  {
    id: "d-05",
    vo:
      "Y no es un problema holandés: en España faltan setecientas cincuenta mil viviendas y se " +
      "terminan noventa y dos mil al año, que es exactamente la misma película.",
    escenas: [
      {
        tipo: "mapa",
        kicker: "LA MISMA PELÍCULA",
        mapa: { destaca: ["holanda", "espana"], region: "europa" },
        rotulo: { kicker: "Dos países, un problema", texto: "La traba es *administrativa*" },
      },
      {
        tipo: "frase",
        texto: "No es que no puedan. Es que *no les dejan*.",
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


/**
 * Prueba de las ilustraciones del video de la deuda francesa, sobre la
 * plantilla "mercado". Cada escena es una de las cinco hechas para ese video.
 */
const PLANOS_MERCADO = [
  {
    id: "m-01",
    vo: "La deuda pública de Francia sube mientras tú escuchas esto, a un ritmo de unos ocho mil seiscientos cincuenta y siete euros por cada segundo que pasa, y al mismo tiempo las tres grandes agencias de calificación le han ido quitando peldaños a su nota desde que perdió la triple A hace más de una década.",
    escenas: [
      {
        tipo: "ilustracion",
        kicker: "DEUDA PÚBLICA",
        fuente: "INSEE · 30 de junio de 2026",
        ilustracion: {
          nombre: "reloj",
          base: 3595500000000,
          porSegundo: 8657,
          nota: "A RITMO DEL PRIMER SEMESTRE DE 2026",
        },
        rotulo: { kicker: "Deuda de Francia", texto: "Sube *mientras miras*" },
      },
      {
        tipo: "ilustracion",
        kicker: "LA NOTA",
        ilustracion: {
          nombre: "escalera",
          agencias: [
            { nombre: "Moody's", peldano: 3, nota: "Aa3", perspectiva: "negativa" },
            { nombre: "S&P", peldano: 4, nota: "A+" },
            { nombre: "Fitch", peldano: 4, nota: "A+" },
          ],
        },
        rotulo: { kicker: "Hasta 2012 tenía la triple A", texto: "Ha bajado *cuatro peldaños*" },
      },
    ],
  },
  {
    id: "m-02",
    vo: "El bono francés a diez años rozó el cinco por ciento esta misma semana, una cifra que hace un año ni se acercaba, y eso encarece cada euro que el Estado pide prestado a unos acreedores que en la mitad de los casos viven fuera del país, y que además llevan cincuenta y un años viendo a Francia cerrar cada ejercicio en rojo, sin una sola excepción en todo ese tiempo.",
    escenas: [
      {
        tipo: "ilustracion",
        kicker: "EL BONO A DIEZ AÑOS",
        ilustracion: {
          nombre: "termometro",
          umbral: 5.0,
          lecturas: [
            { etiqueta: "15 sep 2025 · tras Fitch", valor: 3.51 },
            { etiqueta: "6 oct 2025 · dimite Lecornu", valor: 3.6 },
            { etiqueta: "1 oct 2026", valor: 4.95 },
          ],
        },
        rotulo: { kicker: "Un año después", texto: "Casi *el cinco por ciento*" },
      },
      {
        tipo: "ilustracion",
        kicker: "A QUIÉN LE DEBE",
        ilustracion: {
          nombre: "cuartos",
          cuartos: [
            { etiqueta: "Inversores franceses", nota: "Aseguradoras, bancos, fondos" },
            { etiqueta: "Banque de France", nota: "Unos 630.000 millones, vía BCE" },
            { etiqueta: "Zona euro", nota: "Inversores del resto del euro" },
            { etiqueta: "Fuera del euro", nota: "Los que más huyen primero" },
          ],
        },
        rotulo: { kicker: "Quién presta", texto: "Mitad *de fuera*" },
      },
      {
        tipo: "ilustracion",
        kicker: "SIN UN SOLO AÑO DE SUPERÁVIT",
        ilustracion: { nombre: "anos", desde: 1975, hasta: 2025, etiqueta: "Años con déficit" },
        rotulo: { kicker: "Desde los setenta", texto: "*Cincuenta y un* años seguidos" },
      },
    ],
  },
] as any;

DEMOS.push({
  id: "estilo-francia-suizo",
  guion: {
    slug: "estilo-francia-suizo",
    wpm: 145,
    estilo: { plantilla: "suizo" },
    bloques: [{ planos: PLANOS_MERCADO }],
  } as Guion,
});


const PLANOS_TURQUIA = [
  {
    id: "t-01",
    vo: "La silla del gobernador del Banco Central de Turquía ha tenido seis ocupantes desde dos mil dieciséis, y ninguno de ellos decidió los tipos de interés completamente solo, aunque todos lo intentaron durante el tiempo que les dejaron.",
    escenas: [
      {
        tipo: "ilustracion",
        kicker: "LA SILLA DEL GOBERNADOR",
        ilustracion: {
          nombre: "silla",
          gobernadores: [
            { nombre: "Çetinkaya", meses: 39, fin: "despedido", cuando: "jul 2019" },
            { nombre: "Uysal", meses: 16, fin: "despedido", cuando: "nov 2020" },
            { nombre: "Ağbal", meses: 4, fin: "despedido", cuando: "mar 2021" },
            { nombre: "Kavcıoğlu", meses: 27, fin: "relevado", cuando: "jun 2023" },
            { nombre: "Erkan", meses: 8, fin: "dimitio", cuando: "feb 2024" },
            { nombre: "Karahan", meses: 32, fin: "sigue" },
          ],
        },
        rotulo: { kicker: "Desde 2016", texto: "Seis personas, *una silla*" },
      },
      {
        tipo: "ilustracion",
        kicker: "LAS DOS CURVAS",
        ilustracion: {
          nombre: "tijera",
          desde: "dic 2021",
          hasta: "oct 2022",
          etiquetaTipos: "tipos de interés",
          etiquetaInflacion: "inflación oficial",
          tipos: [{ x: 0, y: 14 }, { x: 0.78, y: 13 }, { x: 0.86, y: 12 }, { x: 1, y: 10.5 }],
          inflacion: [{ x: 0, y: 36.1 }, { x: 1, y: 85.5 }],
        },
        rotulo: { kicker: "Diciembre de 2021 a octubre de 2022", texto: "Una *tijera*" },
      },
    ],
  },
  {
    id: "t-02",
    vo: "El dólar llegó a costar dieciocho liras y media el veinte de diciembre de dos mil veintiuno, y esa misma noche el presidente anunció una medida que lo hizo caer a once en un solo día, pero hoy cuesta casi cincuenta liras.",
    escenas: [
      {
        tipo: "ilustracion",
        kicker: "EL DÓLAR EN LIRAS",
        ilustracion: {
          nombre: "marcador",
          etapas: [
            { etiqueta: "Principios de 2021", valor: 7.4, nota: "Antes de empezar" },
            { etiqueta: "20 dic 2021", valor: 18.5, nota: "Mínimo histórico", sentido: "pierde" },
            { etiqueta: "21 dic 2021", valor: 11.1, nota: "Tras el depósito protegido", sentido: "rebota" },
            { etiqueta: "30 sep 2026", valor: 48.6, nota: "Hoy", sentido: "pierde" },
          ],
        },
        rotulo: { kicker: "Cuántas liras cuesta un dólar", texto: "La lira *se desploma*" },
      },
    ],
  },
] as any;

DEMOS.push({
  id: "estilo-turquia-suizo",
  guion: {
    slug: "estilo-turquia-suizo",
    wpm: 145,
    estilo: { plantilla: "suizo" },
    bloques: [{ planos: PLANOS_TURQUIA }],
  } as Guion,
});
