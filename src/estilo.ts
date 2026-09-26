import React from "react";
import { useCurrentFrame } from "remotion";
import { C, FONT } from "./theme";

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

  /**
   * Como entra cada elemento en pantalla.
   *
   * Este es el campo que de verdad separa un montaje de otro, y el que
   * faltaba. Cambiar el papel, el color y la tipografia deja siete videos
   * distintos de lejos y el mismo video de cerca, porque todo seguia
   * entrando igual: subir veinte pixeles y aparecer. Aqui hay seis maneras
   * mecanicamente distintas de que algo llegue a pantalla.
   *
   *   sube      sube y aparece. Lo de siempre.
   *   mascara   se descubre tras un borde que barre. No hay desvanecido.
   *   golpe     esta o no esta. Cero animacion, solo un golpe de escala.
   *   maquina   se escribe, caracter a caracter.
   *   escala    crece desde pequeno y se pasa de frenada al asentarse.
   *   desmonta  cada pieza llega de un borde distinto, escalonadas.
   */
  entrada: "sube" | "mascara" | "golpe" | "maquina" | "escala" | "desmonta";

  /**
   * Donde se colocan las cosas.
   *
   * El otro motivo de que todos se parecieran: el recorte siempre iba a un
   * lado con el texto al otro, y la frase siempre iba centrada. Cinco
   * maquetas distintas cambian el reparto del cuadro, que es lo primero que
   * se ve antes de leer nada.
   *
   *   lateral   figura a un lado, texto al otro. La de siempre.
   *   banda     figura a sangre por la derecha, texto en bloque a la izquierda.
   *   sangre    figura a pantalla completa, texto encima sobre un velo.
   *   tarjeta   figura y texto en dos fichas con borde, como un tablero.
   *   esquina   la cifra se come el cuadro y la figura se va a una esquina.
   */
  maqueta: "lateral" | "banda" | "sangre" | "tarjeta" | "esquina";

  /**
   * Que pasa una vez ha entrado todo.
   *
   *   deriva      la camara empuja o panea. Lo de siempre.
   *   parallax    figura y texto se mueven a distinta velocidad.
   *   reencuadre  a mitad de escena la maqueta se recoloca de un golpe.
   *   quieto      no se mueve nada. Es una decision, no una falta.
   */
  sostener: "deriva" | "parallax" | "reencuadre" | "quieto";

  /**
   * La forma del grafico de barras.
   *
   * Era siempre la misma: barras verticales centradas. Un grafico de barras
   * horizontales se lee de otra manera -el ojo baja por las etiquetas en vez
   * de recorrer el pie- y un grafico de puntos es casi todo papel en blanco.
   * Con el mismo dato, tres lecturas distintas.
   */
  grafico: "columnas" | "filas" | "puntos";

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
    entrada: "sube",
    maqueta: "lateral",
    sostener: "deriva",
    grafico: "columnas",
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
    entrada: "desmonta",
    maqueta: "esquina",
    sostener: "quieto",
    grafico: "filas",
    transicion: "desliza",
    // Doce por segundo sobre treinta: el paso de tres es el que se ve a saltos
    // de verdad. El temblor que llevaba encima se quito: era el recurso mas
    // barato de las siete plantillas y el unico que se lee como efecto y no
    // como montaje. El caracter de archivo lo dan el papel manila, la
    // mecanografia, el rail y que cada pieza llegue de un lado distinto.
    paso: 3,
    temblor: false,
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
    entrada: "mascara",
    maqueta: "banda",
    sostener: "reencuadre",
    grafico: "filas",
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
    entrada: "escala",
    maqueta: "lateral",
    sostener: "parallax",
    grafico: "puntos",
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
    entrada: "golpe",
    maqueta: "banda",
    sostener: "quieto",
    grafico: "columnas",
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
    entrada: "maquina",
    maqueta: "tarjeta",
    sostener: "quieto",
    grafico: "filas",
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
    entrada: "escala",
    maqueta: "sangre",
    sostener: "deriva",
    grafico: "columnas",
    transicion: "desliza",
    paso: 2,
    temblor: false,
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

/** La familia del titular y del rotulo, segun la plantilla. */
export const familiaDe = (p: Plantilla) =>
  p.titular === "serif" ? FONT.serif : p.titular === "mono" ? FONT.mono : FONT.sans;

/** Un titular mono o serif no lleva el mismo peso que el sans. */
export const pesoDe = (p: Plantilla) =>
  p.titular === "serif" ? 400 : p.titular === "mono" ? 500 : 700;

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
 * El fotograma sin escalonar.
 *
 * El escalonado estaba mal aplicado. La tecnica que se copia es animar los
 * graficos a doce por segundo y montarlos encima de metraje a veinticuatro:
 * lo que pisa es el dibujo, y la imagen sigue yendo fluida. Yo lo habia
 * puesto en todo, camara incluida, y entonces lo que pisaba era la
 * fotografia, que es justo lo que se lee como tembleque y no como montaje.
 *
 * Asi que la camara, el zoom de los clips y el movimiento de las figuras leen
 * de aqui, y el texto, los iconos, las barras y los contadores siguen leyendo
 * del escalonado.
 */
export const useFrameFluido = () => useCurrentFrame();

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
