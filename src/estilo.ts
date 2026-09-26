import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "./theme";

/**
 * Plantillas de edicion.
 *
 * El problema real no era el color. Era que el montaje estaba cableado: papel
 * milimetrado, escuadras en las esquinas, rotulo abajo a la izquierda en
 * Archivo negrita con el resalte ocre, corte seco entre escenas y deriva de
 * camara suave. Dieciseis videos con la misma maqueta. Cambiar el carmin por
 * verde no arregla eso: la plantilla sigue siendo la misma, pintada de otro
 * color.
 *
 * Esto cambia el montaje entero. Una plantilla decide el papel, la textura de
 * fondo, el mobiliario de marco, la familia tipografica del titular, donde y
 * como se maqueta el rotulo, como se resalta la palabra clave, como se dibujan
 * los iconos, como se corta de una escena a otra y a cuantos fotogramas por
 * segundo se animan las cosas.
 *
 * Ese ultimo campo es el que mas se nota y el menos evidente: el motion de los
 * documentales de YouTube se anima a doce fotogramas por segundo y se mete en
 * un montaje a veinticuatro, asi que los graficos avanzan a saltos mientras el
 * video de fondo va fluido. Suena a error y es justo lo contrario: una
 * animacion perfectamente suave se lee como corporativa, y una que pisa un
 * poco se lee como alguien ensenandote algo. Es `paso`.
 */
export type Plantilla = {
  nombre: string;
  /** Una linea para el que escribe el guion. */
  descripcion: string;

  /** El papel. Tambien pinta el fondo de todos los planos. */
  papel: string;
  /** La tinta: el color del texto y de los graficos sobre ese papel. */
  tinta: string;
  /** El color de los rotulillos y las fuentes. */
  apagado: string;
  /** El unico color saturado: graficos, cifras, filetes. */
  acento: string;
  /** El resalte de la palabra clave. */
  realce: string;

  /** Fondo: que se dibuja debajo de todo. */
  textura: "rejilla" | "puntos" | "rayas" | "planos" | "trama" | "liso";
  /** Mobiliario de marco. */
  marco: "escuadras" | "caja" | "rail" | "ninguno";
  /** Cantidad de grano. 0 lo apaga. */
  grano: number;

  /** Familia del titular y del rotulo. */
  titular: "sans" | "serif" | "mono";
  /** Caja alta fuerza mayusculas en titulares y rotulos. */
  caja: "normal" | "alta";
  /** Cuanto se aprieta el interletraje del titular. */
  apriete: string;

  /** Maqueta del rotulo inferior. */
  rotulo: "bloque" | "barra" | "tarjeta" | "rail" | "sello";
  /** Como se marca la palabra clave. */
  resalte: "slab" | "subrayado" | "caja" | "color";

  /** Como se dibujan los iconos. */
  icono: "trazo" | "solido" | "chapa" | "ninguno";
  /** Tratamiento del recorte fotografico. */
  recorte: "mancha" | "orla" | "bloque" | "limpio";

  /** El corte entre escenas de un mismo plano. */
  transicion: "corte" | "desliza" | "barrido" | "flash" | "negro";
  /** Fotogramas por paso de animacion. 1 es fluido; 3 son diez por segundo. */
  paso: number;
  /** Temblor y parpadeo de fotograma, como un montaje de archivo. */
  temblor: boolean;
  /** Movimiento de camara por defecto. */
  camara: "deriva" | "quieta" | "lenta";
};

/** El papel calido del expediente, mas amarillo que el del canal. */
const MANILA = "#EDE4CE";
const CIAN = "#0E2A3F";
const CARBON = "#101312";

/**
 * Las plantillas del canal.
 *
 * Cada una viene de un sitio real, no de tocar parametros al azar:
 *
 *   cuaderno    lo que el canal ha sido hasta ahora. Es el valor por defecto,
 *               para que los dieciseis videos ya publicados no cambien.
 *   expediente  el montaje de archivo: papel manila, mecanografia, sello,
 *               temblor de fotograma y animacion a saltos.
 *   suizo       estilo tipografico internacional: rejilla, Archivo grande a
 *               bandera izquierda, filetes finos y cero adorno.
 *   plano       cianotipo. Fondo azul de plano de obra, linea blanca fina,
 *               rotulacion monoespaciada.
 *   prensa      sabana de periodico: serif de titular, corondeles, entradilla.
 *   terminal    brutalismo: monoespaciada en caja alta, cajas de borde duro,
 *               corte con destello y animacion a diez por segundo.
 *   riso        risografia: dos tintas mal registradas, grano alto, cartel.
 */
export const PLANTILLAS: Record<string, Plantilla> = {
  cuaderno: {
    nombre: "cuaderno",
    descripcion: "Papel milimetrado y escuadras. El montaje de siempre del canal.",
    papel: C.paper,
    tinta: C.ink,
    apagado: C.muted,
    acento: C.carmin,
    realce: C.ocre,
    textura: "rejilla",
    marco: "escuadras",
    grano: 0.16,
    titular: "sans",
    caja: "normal",
    apriete: "-0.03em",
    rotulo: "bloque",
    resalte: "slab",
    icono: "trazo",
    recorte: "mancha",
    transicion: "corte",
    paso: 1,
    temblor: false,
    camara: "deriva",
  },

  expediente: {
    nombre: "expediente",
    descripcion:
      "Archivo desclasificado: papel manila, mecanografia, sello y animacion a saltos.",
    papel: MANILA,
    tinta: "#241C10",
    apagado: "#7A6A4C",
    acento: "#9E2B20",
    realce: "#D9C48A",
    textura: "liso",
    marco: "rail",
    grano: 0.3,
    titular: "mono",
    caja: "alta",
    apriete: "0.02em",
    rotulo: "sello",
    resalte: "caja",
    icono: "solido",
    recorte: "orla",
    transicion: "desliza",
    // Doce por segundo sobre treinta: el paso de tres es el que se ve a saltos
    // de verdad, y con el temblor encima parece pelicula proyectada.
    paso: 3,
    temblor: true,
    camara: "lenta",
  },

  suizo: {
    nombre: "suizo",
    descripcion:
      "Estilo tipografico internacional: rejilla, titular enorme a bandera y cero adorno.",
    papel: "#F7F6F2",
    tinta: "#111111",
    apagado: "#6B6B6B",
    acento: "#D8342A",
    // El suizo marca la palabra con color, no con mancha, asi que este token
    // solo pinta los fondos blandos: un gris de papel, nunca el negro de la
    // tinta, que tapaba el dibujo que hay detras.
    realce: "#E4E1D8",
    textura: "liso",
    marco: "ninguno",
    grano: 0.05,
    titular: "sans",
    caja: "normal",
    apriete: "-0.045em",
    rotulo: "barra",
    // El resalte suizo no es una mancha de color: es la palabra en negativo.
    resalte: "color",
    icono: "trazo",
    recorte: "limpio",
    transicion: "corte",
    paso: 1,
    temblor: false,
    camara: "quieta",
  },

  plano: {
    nombre: "plano",
    descripcion: "Cianotipo de obra: fondo azul, linea blanca fina y rotulacion tecnica.",
    papel: CIAN,
    tinta: "#E8F1F6",
    apagado: "#7FA8BF",
    acento: "#F2B23C",
    realce: "#1D4A66",
    textura: "planos",
    marco: "caja",
    grano: 0.12,
    titular: "mono",
    caja: "alta",
    apriete: "0.04em",
    rotulo: "tarjeta",
    resalte: "caja",
    icono: "trazo",
    recorte: "bloque",
    transicion: "barrido",
    paso: 2,
    temblor: false,
    camara: "lenta",
  },

  prensa: {
    nombre: "prensa",
    descripcion: "Sabana de periodico: titular serif, corondeles y trama de medios tonos.",
    papel: "#F4F1E8",
    tinta: "#1A1A18",
    apagado: "#6A6862",
    acento: "#8C1C13",
    realce: "#DCD3BC",
    textura: "rayas",
    marco: "caja",
    grano: 0.2,
    titular: "serif",
    caja: "normal",
    apriete: "-0.01em",
    rotulo: "barra",
    resalte: "subrayado",
    icono: "ninguno",
    recorte: "orla",
    transicion: "corte",
    paso: 1,
    temblor: false,
    camara: "quieta",
  },

  terminal: {
    nombre: "terminal",
    descripcion: "Brutalismo de consola: monoespaciada en caja alta, cajas duras y destello.",
    papel: CARBON,
    tinta: "#E6F0E9",
    apagado: "#6E8479",
    acento: "#4ADE80",
    realce: "#1F2A24",
    textura: "puntos",
    marco: "caja",
    grano: 0.08,
    titular: "mono",
    caja: "alta",
    apriete: "0.06em",
    rotulo: "tarjeta",
    resalte: "caja",
    icono: "chapa",
    recorte: "bloque",
    transicion: "flash",
    paso: 3,
    temblor: false,
    camara: "quieta",
  },

  riso: {
    nombre: "riso",
    descripcion: "Risografia: dos tintas mal registradas, grano alto y tipo de cartel.",
    papel: "#F3EFE2",
    tinta: "#1B2A4A",
    apagado: "#6E7A93",
    acento: "#E8483C",
    realce: "#F0C24B",
    textura: "trama",
    marco: "ninguno",
    grano: 0.34,
    titular: "sans",
    caja: "alta",
    apriete: "-0.05em",
    rotulo: "sello",
    resalte: "slab",
    icono: "solido",
    recorte: "bloque",
    transicion: "desliza",
    paso: 2,
    temblor: true,
    camara: "deriva",
  },
};

export const POR_DEFECTO = PLANTILLAS.cuaderno;

/** Lo que un guion puede tocar sin salirse de su plantilla. */
export type Estilo = {
  /** El nombre de la plantilla. */
  plantilla?: string;
  /** Sobrescribe el acento de la plantilla. */
  acento?: "carmin" | "verde" | "ocre" | "pale";
  /** Apaga la textura de fondo. */
  grid?: boolean;
  /** Apaga el mobiliario de marco. */
  marco?: boolean;
};

const ACENTOS: Record<string, string> = {
  carmin: C.carmin,
  verde: C.verde,
  ocre: C.ocre,
  pale: C.paleDim,
};

/** Resuelve el bloque `estilo` de un guion a una plantilla completa. */
export const resolver = (e: Estilo = {}): Plantilla => {
  const base = PLANTILLAS[e.plantilla ?? ""] ?? POR_DEFECTO;
  return {
    ...base,
    acento: e.acento ? ACENTOS[e.acento] ?? base.acento : base.acento,
    textura: e.grid === false ? "liso" : base.textura,
    marco: e.marco === false ? "ninguno" : base.marco,
  };
};

/**
 * Las variables CSS que planta la raiz del video.
 *
 * El truco del acento ya estaba: una variable en el contenedor repinta de
 * golpe los cuarenta y cuatro sitios donde habia un carmin escrito a mano.
 * Esto lo extiende al papel, a la tinta y al resalte, que es lo que hacia
 * falta para que una plantilla oscura fuera legible sin tocar cincuenta y
 * tres componentes uno a uno.
 */
export const variablesDe = (p: Plantilla): React.CSSProperties =>
  ({
    "--papel": p.papel,
    "--tinta": p.tinta,
    "--apagado": p.apagado,
    "--acento": p.acento,
    "--realce": p.realce,
  }) as React.CSSProperties;

export const PlantillaCtx = React.createContext<Plantilla>(POR_DEFECTO);
export const usePlantilla = () => React.useContext(PlantillaCtx);

/**
 * El fotograma, escalonado segun la plantilla.
 *
 * Esta es la pieza que convierte un montaje fluido en uno que pisa. Cualquier
 * componente que anime tiene que leer el tiempo de aqui y no de Remotion
 * directamente: con `paso` a uno devuelve exactamente lo mismo que antes, y
 * con `paso` a tres la misma animacion avanza diez veces por segundo en vez
 * de treinta, sin tocar una sola interpolacion.
 */
export const useFrame = () => {
  const frame = useCurrentFrame();
  const { paso } = usePlantilla();
  return paso > 1 ? Math.floor(frame / paso) * paso : frame;
};

/**
 * Temblor de fotograma: giro y desplazamiento minimos que cambian cada paso.
 *
 * Es lo que separa un montaje de archivo de una diapositiva. Sin esto una
 * imagen quieta se lee como digital; con esto se lee como algo que alguien
 * puso delante de una camara.
 */
export const useTemblor = (semilla = 0) => {
  const frame = useCurrentFrame();
  const { temblor, paso } = usePlantilla();
  if (!temblor) return { giro: 0, x: 0, y: 0, brillo: 1 };
  const n = Math.floor(frame / Math.max(paso, 2)) + semilla * 7;
  // Ruido barato y determinista: mismo fotograma, mismo temblor en cada
  // renderizado, que es imprescindible con render distribuido.
  const s = (k: number) => {
    const v = Math.sin(n * 12.9898 + k * 78.233) * 43758.5453;
    return v - Math.floor(v) - 0.5;
  };
  return {
    giro: s(1) * 0.42,
    x: s(2) * 3.2,
    y: s(3) * 3.2,
    brillo: 1 + s(4) * 0.05,
  };
};
