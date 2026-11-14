import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloAndes, Cordillera, Humo, Mula, TexturasPot, mezcla, osc, rr, sat } from "./comun";
import { Frente, Perfil } from "./Gente";

/**
 * La Ribera de los ingenios: una rueda hidraulica movida por el agua de las
 * lagunas de Kari Kari que levanta los mazos que trituran el mineral. Y el
 * patio de amalgama, donde el mineral molido se mezcla con mercurio y se pisa,
 * con el horno de desazogar al fondo (o los hornos de aludeles).
 */

/* ------------------------------------------------------------------ */
/* pot/ingenio                                                          */
/* ------------------------------------------------------------------ */

const Rueda: React.FC<{ x: number; y: number; r: number; giro: number; rota?: boolean }> = ({ x, y, r, giro, rota }) => (
  <g transform={`translate(${x} ${y}) rotate(${rota ? 18 : 0})`}>
    <circle r={r} fill="none" stroke={C.madera} strokeWidth={22} />
    <circle r={r - 30} fill="none" stroke={C.maderaMedia} strokeWidth={8} />
    <g transform={`rotate(${giro})`}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={-7} y={-r} width={14} height={2 * r} fill={C.maderaMedia} transform={`rotate(${i * 22.5})`} />
      ))}
      {Array.from({ length: 20 }).map((_, i) => (
        <rect key={i} x={-26} y={-r - 22} width={52} height={30} fill={C.maderaLuz} transform={`rotate(${i * 18})`} />
      ))}
    </g>
    <circle r={34} fill={C.madera} />
    <circle r={14} fill={"#3A3A3E"} />
  </g>
);

const Agua: React.FC<{ d: string; f: number; ancho?: number }> = ({ d, f, ancho = 30 }) => (
  <g>
    <path d={d} stroke={C.agua} strokeWidth={ancho} fill="none" strokeLinecap="round" />
    <path d={d} stroke={C.aguaLuz} strokeWidth={ancho * 0.25} fill="none" strokeDasharray="30 50" strokeDashoffset={-f * 6} strokeLinecap="round" />
  </g>
);

const DibujoIngenio: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 6;
  const gente = e.gente ?? 0.7;
  const riada = e.variante === "riada";
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.16) : c);
  const giro = riada ? 0 : f * 1.6;
  const ola = riada ? sat(f / 150) : 0;
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={1920} id="ingenio" nubes={3} />
      <Cordillera y={360} ancho={1920} semilla={17} color={t("#B4ADA0")} alto={200} />
      {/* la sierra de Kari Kari con la laguna y su dique */}
      <path d="M -100 420 Q 300 300 700 340 Q 1100 380 1500 330 Q 1800 300 2020 360 L 2020 1080 L -100 1080 Z" fill={t("#A39A86")} />
      <path d="M 60 380 Q 300 350 560 372 L 560 420 Q 300 440 60 420 Z" fill={t(C.agua)} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={120 + i * 140} y={390 + (i % 2) * 12} width={80} height={3} fill={t(C.aguaLuz)} />
      ))}
      {/* el dique de piedra */}
      {riada ? (
        <g>
          <path d="M 540 360 L 600 350 L 610 380 L 560 440 Z" fill={t(C.piedraSombra)} />
          <path d="M 620 350 L 680 360 L 680 440 L 640 430 Z" fill={t(C.piedraSombra)} />
          <path d={`M 590 380 Q 620 ${420 + Math.sin(f * 0.4) * 6} 640 520 L 600 520 Z`} fill={t(C.agua)} />
          {Array.from({ length: 6 }).map((_, i) => (
            <circle key={i} cx={610 + rr(i, 3) * 40} cy={((f * 4 + i * 30) % 140) + 400} r={8} fill={C.aguaLuz} opacity={0.7} />
          ))}
        </g>
      ) : (
        <g>
          <path d="M 540 362 L 680 352 L 690 440 L 548 440 Z" fill={t(C.piedra)} />
          <path d="M 540 362 L 680 352 L 690 440 L 548 440 Z" fill="url(#pot-sillar)" opacity={0.5} />
        </g>
      )}
      {/* la acequia que baja */}
      <Agua d="M 690 430 Q 760 480 720 540 Q 680 600 760 640 L 860 640" f={f} ancho={18} />
      {/* la quebrada en primer termino */}
      <path d="M -100 900 Q 600 870 1200 900 Q 1600 920 2020 890 L 2020 1080 L -100 1080 Z" fill={t(C.tierra)} />
      <path d="M -100 960 Q 700 930 1300 960 Q 1700 980 2020 950 L 2020 1020 Q 1600 1040 1200 1010 Q 600 990 -100 1020 Z" fill={t(C.agua)} />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={((rr(i, 5) * 2000 + f * 3) % 2100) - 100} y={970 + rr(i, 6) * 30} width={50 + rr(i, 7) * 80} height={4} fill={C.aguaLuz} opacity={0.8} />
      ))}
      {/* el edificio del ingenio */}
      <g>
        <rect x={900} y={520} width={760} height={380} fill={t(C.adobe)} />
        <rect x={900} y={520} width={760} height={380} fill="url(#pot-adobe)" opacity={0.6} />
        <path d="M 870 530 L 1280 440 L 1690 530 Z" fill={t(C.teja)} />
        <path d="M 870 530 L 1280 440 L 1690 530 Z" fill="url(#pot-tejado)" opacity={0.6} />
        <rect x={960} y={580} width={640} height={320} fill={t("#4A3A2E")} />
        {/* el arbol de levas */}
        <rect x={700} y={642} width={900} height={18} fill={t(C.madera)} />
        {/* los mazos */}
        {Array.from({ length: 5 }).map((_, i) => {
          const fase = riada ? 0 : ((f * 0.1 + i * 1.25) % 6.28);
          const sube = riada ? 0 : Math.max(0, Math.sin(fase)) * 60;
          const x = 1040 + i * 110;
          return (
            <g key={i}>
              <rect x={x - 8} y={600} width={16} height={60} fill={t(C.maderaLuz)} transform={`rotate(${riada ? 0 : fase * 57} ${x} 651)`} />
              <g transform={`translate(0 ${-sube})`}>
                <rect x={x - 22} y={560} width={44} height={260} fill={t(C.maderaMedia)} />
                <rect x={x - 22} y={560} width={12} height={260} fill={t(C.maderaLuz)} opacity={0.6} />
                <rect x={x - 26} y={800} width={52} height={38} fill={t("#4A4A4E")} />
                <rect x={x - 30} y={680} width={60} height={14} fill={t(C.madera)} />
              </g>
            </g>
          );
        })}
        <rect x={980} y={540} width={600} height={24} fill={t(C.madera)} />
        {/* el mortero con el mineral */}
        <rect x={990} y={836} width={580} height={64} fill={t(C.piedraSombra)} />
        <path d="M 1000 840 Q 1100 822 1200 840 Q 1300 824 1400 840 Q 1500 826 1560 840 Z" fill={t("#8E847A")} />
        {Array.from({ length: 10 }).map((_, i) => {
          const tt = (f * 0.03 + i / 10) % 1;
          return <circle key={i} cx={1040 + (i % 5) * 110 + tt * 30} cy={830 - tt * 100} r={6 + tt * 16} fill={"#CFC6B8"} opacity={riada ? 0 : (1 - tt) * 0.35} />;
        })}
        <rect x={900} y={880} width={760} height={30} fill={t(C.piedraSombra)} />
      </g>
      {/* canoa que vierte sobre la rueda */}
      <rect x={560} y={400} width={220} height={20} fill={t(C.madera)} transform="rotate(0)" />
      <rect x={560} y={400} width={220} height={8} fill={t(C.agua)} />
      {riada ? null : (
        <g>
          <path d="M 780 412 Q 800 420 790 470" stroke={C.agua} strokeWidth={22} fill="none" />
          <path d="M 780 412 Q 800 420 790 470" stroke={C.aguaLuz} strokeWidth={6} fill="none" strokeDasharray="12 18" strokeDashoffset={-f * 4} />
        </g>
      )}
      <Rueda x={700} y={650} r={210} giro={giro} rota={riada} />
      <path d="M 520 860 L 880 860 L 880 900 L 520 900 Z" fill={t(C.piedraSombra)} />
      {/* espuma bajo la rueda */}
      {riada ? null : Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={560 + i * 50 + Math.sin(f * 0.3 + i) * 6} cy={870} r={10 + (i % 2) * 6} fill={C.aguaLuz} opacity={0.8} />)}
      {/* la gente */}
      {riada ? null : (
        <g>
          <Perfil traje="andino" semilla={sem + 1} x0={1720} y={902} s={0.7} pose="carga" espalda="costal" v={-0.4} ritmo={0.7} />
          {gente > 0.3 ? <Mula x0={2100} y={900} v={-0.9} s={0.6} semilla={sem} carga="fardos" /> : null}
          {gente > 0.3 ? <Perfil traje="andino" semilla={sem + 2} x0={2250} y={900} v={-0.9} s={0.6} /> : null}
          {gente > 0.5 ? <Frente traje="espanol" semilla={sem + 3} x={1820} y={930} s={0.78} pose="senala" gesto="serio" mirada={-1} /> : null}
          <Perfil traje="andino" semilla={sem + 4} x0={360} y={900} s={0.66} pose="carga" espalda="costal" v={0.5} />
        </g>
      )}
      {/* la riada */}
      {riada ? (
        <g>
          <path
            d={`M -100 ${560 + (1 - ola) * 400} Q ${300 + ola * 400} ${520 + (1 - ola) * 380 + Math.sin(f * 0.2) * 20} ${700 + ola * 900} ${700 + (1 - ola) * 300} L ${700 + ola * 1400} 1080 L -100 1080 Z`}
            fill={"#7E8E86"}
            opacity={0.92}
          />
          {Array.from({ length: 14 }).map((_, i) => (
            <path
              key={i}
              d={`M ${rr(i, 2) * (600 + ola * 1200) - 100} ${760 + rr(i, 3) * 300} q 30 -20 60 0 q 30 20 60 0`}
              stroke={"#C9D4CE"}
              strokeWidth={6}
              fill="none"
              transform={`translate(${(f * 3) % 80} 0)`}
            />
          ))}
          {/* vigas arrastradas */}
          {[0, 1, 2].map((i) => (
            <rect key={i} x={200 + i * 260 + f * (1 + i * 0.4)} y={860 + i * 40} width={140} height={16} fill={C.madera} transform={`rotate(${10 + i * 20 + f * 0.3} ${270 + i * 260 + f} ${868 + i * 40})`} />
          ))}
          {/* gente que huye ladera arriba */}
          {[0, 1, 2, 3].map((i) => (
            <Perfil key={i} traje={i % 2 ? "andina" : "andino"} semilla={sem + 10 + i} x0={1500 + i * 90} y={600 - i * 30} v={1.6} vy={-0.3} s={0.4} ritmo={1.6} />
          ))}
        </g>
      ) : null}
    </g>
  );
};

export const INGENIO: Decorado = {
  desc: "Un ingenio de la Ribera de Potosi: al fondo la sierra de Kari Kari con una laguna artificial y su dique de piedra; una acequia baja hasta una gran rueda hidraulica que gira y mueve el arbol de levas que levanta los mazos que trituran el mineral en el mortero, entre polvo; delante la quebrada con agua; un indio echa mineral con la pala, llega una mula, un espanol senala. Variante 'riada': el dique de la laguna revienta y el agua baja arrasando la quebrada; la gente huye ladera arriba (sin cuerpos).",
  admite: "variante ('riada': la rotura de la laguna de San Ildefonso en 1626), hora, gente, semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.06 }, desc: "laguna, acequia, rueda e ingenio" },
    rueda: { de: { x: 720, y: 640, z: 2 }, a: { x: 720, y: 620, z: 2.2 }, desc: "la rueda hidraulica girando" },
    mazos: { de: { x: 1260, y: 720, z: 2.3 }, a: { x: 1280, y: 720, z: 2.5 }, desc: "los mazos que trituran el mineral" },
    laguna: { de: { x: 480, y: 360, z: 2.2 }, a: { x: 560, y: 370, z: 2.4 }, desc: "la laguna y su dique (en la riada, el dique roto)" },
    obreros: { de: { x: 1500, y: 760, z: 2.3 }, a: { x: 1520, y: 750, z: 2.5 }, desc: "el indio de la pala y el espanol que senala" },
  },
  dibujo: DibujoIngenio,
};

/* ------------------------------------------------------------------ */
/* pot/patio                                                            */
/* ------------------------------------------------------------------ */

/** Un "cuerpo": monton circular de mineral molido con azogue. */
const Cuerpo: React.FC<{ x: number; y: number; s: number; t: (c: string) => string }> = ({ x, y, s, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={230} ry={50} fill={t("#6E6A66")} />
    <ellipse cx={0} cy={-8} rx={210} ry={40} fill={t("#8A8580")} />
    {Array.from({ length: 12 }).map((_, i) => (
      <path key={i} d={`M ${-180 + i * 30} ${-12 + (i % 3) * 8} q 12 -6 24 0`} stroke={t("#A6A19A")} strokeWidth={4} fill="none" />
    ))}
    <ellipse cx={-60} cy={-14} rx={14} ry={4} fill={C.azogue} opacity={0.8} />
    <ellipse cx={70} cy={-4} rx={10} ry={3} fill={C.azogue} opacity={0.8} />
  </g>
);

/** Horno de aludeles: lineas de vasijas de barro encadenadas sobre el horno. */
const Aludeles: React.FC<{ x: number; y: number; t: (c: string) => string }> = ({ x, y, t }) => (
  <g>
    <rect x={x} y={y - 300} width={240} height={300} fill={t(C.adobe)} />
    <rect x={x} y={y - 300} width={240} height={300} fill="url(#pot-adobe)" opacity={0.6} />
    <path d={`M ${x + 70} ${y} L ${x + 70} ${y - 80} Q ${x + 120} ${y - 120} ${x + 170} ${y - 80} L ${x + 170} ${y} Z`} fill={"#2A1A12"} />
    <path d={`M ${x + 80} ${y} Q ${x + 120} ${y - 60} ${x + 160} ${y} Z`} fill={"#F2A23C"} opacity={0.8} />
    {[0, 1, 2].map((fila) => (
      <g key={fila}>
        {Array.from({ length: 9 }).map((_, i) => (
          <ellipse key={i} cx={x + 250 + i * 44} cy={y - 260 + fila * 70 + i * 6} rx={24} ry={16} fill={t(i % 2 ? "#B8784E" : "#A86A44")} />
        ))}
      </g>
    ))}
    <rect x={x + 240} y={y - 60} width={420} height={60} fill={t(C.adobeSombra)} />
    <rect x={x + 620} y={y - 140} width={70} height={140} fill={t(C.adobe)} />
  </g>
);

const Gotas: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => (
  <g>
    {Array.from({ length: 8 }).map((_, i) => {
      const tt = ((f * 0.04 + i / 8) % 1);
      return <circle key={i} cx={x + Math.sin(i * 2.1) * 10 + tt * 6} cy={y + tt * 160} r={4} fill={C.plataLuz} stroke={C.plataSombra} strokeWidth={1} opacity={1 - tt * 0.3} />;
    })}
  </g>
);

const DibujoPatio: React.FC<PropsDecorado> = ({ e }) => {
  const f = useCurrentFrame();
  const hora = e.hora ?? "dia";
  const sem = e.semilla ?? 8;
  const gente = e.gente ?? 0.8;
  const aludeles = e.variante === "aludeles";
  const t = (c: string) => (hora === "noche" ? mezcla(c, "#1A2030", 0.55) : hora === "tarde" ? mezcla(c, "#E0A060", 0.16) : c);
  return (
    <g>
      <TexturasPot />
      <CieloAndes hora={hora} ancho={2200} id="patio" nubes={3} />
      {aludeles ? <Cordillera y={420} ancho={2200} semilla={29} color={t("#A89E8A")} alto={220} nieve={false} /> : <path d="M 600 420 Q 900 120 1000 110 Q 1100 120 1400 420 Z" fill={t(C.cerroLuz)} />}
      {/* tapias del patio */}
      <rect x={-100} y={380} width={2400} height={180} fill={t(C.adobe)} />
      <rect x={-100} y={380} width={2400} height={180} fill="url(#pot-adobe)" opacity={0.6} />
      <rect x={-100} y={370} width={2400} height={16} fill={t(C.tejaSombra)} />
      {/* galpon y tinas de lavar a la izquierda */}
      <rect x={-100} y={300} width={520} height={260} fill={t(C.cal)} />
      <path d="M -120 300 L 160 230 L 440 300 Z" fill={t(C.teja)} />
      <rect x={20} y={380} width={300} height={180} fill={t("#4A3A2E")} />
      {[0, 1].map((i) => (
        <g key={i}>
          <ellipse cx={90 + i * 170} cy={560} rx={70} ry={18} fill={t(C.maderaMedia)} />
          <rect x={20 + i * 170} y={500} width={140} height={60} fill={t(C.madera)} />
          <ellipse cx={90 + i * 170} cy={500} rx={70} ry={16} fill={t(C.agua)} />
        </g>
      ))}
      {/* el suelo empedrado */}
      <rect x={-100} y={560} width={2400} height={560} fill={t(C.piedraSombra)} />
      <rect x={-100} y={560} width={2400} height={560} fill="url(#pot-empedrado)" opacity={0.45} />
      {/* los cuerpos de mineral */}
      <Cuerpo x={420} y={700} s={0.8} t={t} />
      <Cuerpo x={1000} y={680} s={0.75} t={t} />
      <Cuerpo x={700} y={900} s={1.1} t={t} />
      <Cuerpo x={1340} y={880} s={1} t={t} />
      {/* repasiris pisando la mezcla */}
      <Perfil traje="andino" semilla={sem + 1} x0={640} y={900} s={0.82} pose="pisa" ritmo={0.6} gorro="montera" />
      <Perfil traje="andino" semilla={sem + 2} x0={850} y={915} s={0.86} pose="pisa" ritmo={0.55} gorro="chullo" />
      {gente > 0.4 ? <Perfil traje="andino" semilla={sem + 3} x0={1420} y={880} s={0.78} pose="pisa" ritmo={0.65} dir={-1} /> : null}
      {gente > 0.6 ? <Perfil traje="andino" semilla={sem + 4} x0={400} y={700} s={0.56} pose="pisa" ritmo={0.6} /> : null}
      {gente > 0.6 ? <Perfil traje="andino" semilla={sem + 5} x0={1000} y={680} s={0.52} pose="pisa" ritmo={0.7} dir={-1} /> : null}
      {/* el azoguero exprime el mercurio por un pano */}
      <Frente traje="espanol" semilla={sem + 6} x={1130} y={1010} s={0.95} pose="ofrece" objeto="bolsa" gesto="serio" mirada={1} />
      <Gotas x={1250} y={710} f={f} />
      {/* badanas de azogue y frascos */}
      <g transform="translate(1860 1010)">
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${-40 + i * 50} 0 Q ${-60 + i * 50} -50 ${-30 + i * 50} -70 Q ${0 + i * 50} -80 ${10 + i * 50} -60 Q ${20 + i * 50} -20 ${10 + i * 50} 0 Z`} fill={t(i % 2 ? "#8A6A44" : "#7A5A3A")} />
        ))}
        <path d="M 120 0 L 116 -70 L 150 -70 L 146 0 Z" fill={t("#4A4A4E")} />
        <rect x={124} y={-82} width={18} height={14} fill={t("#3A3A3E")} />
      </g>
      {/* al fondo: el horno de desazogar o los aludeles */}
      {aludeles ? (
        <g>
          <Aludeles x={1380} y={560} t={t} />
          <Humo x={1500} y={260} s={1.4} n={6} semilla={4} color={"#C9CCC4"} />
          <Humo x={1900} y={300} s={1.2} n={5} semilla={5} color={"#C9CCC4"} />
          <Perfil traje="andino" semilla={sem + 9} x0={1360} y={600} s={0.5} pose="carga" espalda="costal" v={0.4} />
        </g>
      ) : (
        <g>
          <rect x={1500} y={260} width={420} height={300} fill={t(C.adobe)} />
          <path d="M 1480 270 L 1710 200 L 1940 270 Z" fill={t(C.teja)} />
          <path d="M 1600 560 L 1600 430 Q 1660 360 1720 430 L 1720 560 Z" fill={"#2A1A12"} />
          <path d="M 1610 560 Q 1660 470 1710 560 Z" fill={"#F2A23C"} opacity={0.75} />
          <path d="M 1760 330 Q 1810 270 1860 330 L 1860 400 L 1760 400 Z" fill={t("#8A8580")} />
          <Humo x={1810} y={260} s={1.2} n={6} semilla={6} color={"#C9CCC4"} />
          {/* pinas de plata sobre la mesa */}
          <rect x={1940} y={480} width={200} height={14} fill={t(C.maderaLuz)} />
          <rect x={1950} y={494} width={12} height={66} fill={t(C.madera)} />
          <rect x={2118} y={494} width={12} height={66} fill={t(C.madera)} />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${1966 + i * 60} 480 L ${1980 + i * 60} 430 Q ${1990 + i * 60} 420 ${2000 + i * 60} 430 L ${2014 + i * 60} 480 Z`} fill={C.plata} stroke={C.plataSombra} strokeWidth={2} />
          ))}
        </g>
      )}
    </g>
  );
};

export const PATIO: Decorado = {
  desc: "El patio de amalgama de un ingenio: tapias de adobe, tinas de lavar bajo un galpon, suelo empedrado con 'cuerpos' de mineral molido mezclado con azogue que los indios pisan descalzos; un azoguero espanol exprime el mercurio por un pano y caen gotas plateadas; badanas de azogue; al fondo el horno de desazogar con humo y las pinas de plata en una mesa. Variante 'aludeles': al fondo los hornos de aludeles de Huancavelica, con sus lineas de vasijas de barro.",
  ancho: 2200,
  admite: "variante ('aludeles': hornos de aludeles), hora, gente, semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1200, y: 540, z: 1.04 }, desc: "el patio entero" },
    pies: { de: { x: 720, y: 820, z: 2.6 }, a: { x: 740, y: 810, z: 2.9 }, desc: "las piernas que pisan la mezcla" },
    repasiris: { de: { x: 760, y: 700, z: 1.8 }, a: { x: 800, y: 700, z: 1.9 }, desc: "los indios pisando los cuerpos" },
    azogue: { de: { x: 1180, y: 720, z: 2.4 }, a: { x: 1200, y: 700, z: 2.7 }, desc: "el azoguero y las gotas de mercurio" },
    horno: { de: { x: 1720, y: 300, z: 2.4 }, a: { x: 1740, y: 310, z: 2.6 }, desc: "el horno con humo y las pinas de plata (o los aludeles)" },
  },
  dibujo: DibujoPatio,
};
