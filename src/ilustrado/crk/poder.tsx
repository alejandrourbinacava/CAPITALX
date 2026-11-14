import React from "react";
import { interpolate } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { BanderaUSA, C, Defs, Humo, T, Ventana, miles, oscurecer, rr, suave } from "./comun";
import { Figura, Espalda } from "./gente";

/* ------------------------------------------------------------------ */
/* La sala del consejo: banqueros, la Reserva Federal                  */
/* ------------------------------------------------------------------ */

const Retrato: React.FC<{ x: number; y: number; sem: number }> = ({ x, y, sem }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-90} y={-120} width={180} height={240} fill={C.laton} />
    <rect x={-78} y={-108} width={156} height={216} fill={"#3A3026"} />
    <g transform="translate(0 80) scale(0.42)">
      <Figura x={0} y={180} semilla={sem} atuendo="traje" gorro="ninguno" cuerpo="busto" largo={60} gesto="serio" rasgos={{ edad: "mayor" }} />
    </g>
    <rect x={-78} y={-108} width={156} height={216} fill={"#2A1E16"} opacity={0.25} />
  </g>
);

const DibujoConsejo: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 13;
  const gente = e.gente ?? 0.9;
  const placa = e.textos?.placa ?? "";
  const tenso = e.variante === "crisis";
  const n = Math.round(5 * gente) + 2;
  return (
    <g>
      <Defs />
      {/* paneles de madera */}
      <rect x={-200} y={-200} width={2320} height={1500} fill={C.maderaMedia} />
      {Array.from({ length: 14 }).map((_, i) => (
        <g key={i}>
          <rect x={-180 + i * 170} y={420} width={150} height={240} fill={oscurecer(C.maderaMedia, 0.88)} />
          <rect x={-170 + i * 170} y={430} width={130} height={220} fill="none" stroke={C.maderaLuz} strokeWidth={3} />
        </g>
      ))}
      <rect x={-200} y={400} width={2320} height={20} fill={C.maderaLuz} />
      {/* ventanales con cortinas */}
      {[180, 1460].map((vx) => (
        <g key={vx}>
          <Ventana x={vx} y={80} w={280} h={300} marco={C.maderaLuz} cristal={"#BFC6BE"} />
          <g opacity={0.5}>
            <rect x={vx + 20} y={200} width={80} height={180} fill={"#9EA296"} />
            <rect x={vx + 140} y={160} width={100} height={220} fill={"#A9ACA0"} />
          </g>
          <path d={`M ${vx - 40} 60 Q ${vx + 10} 240 ${vx - 30} 420 L ${vx - 70} 420 L ${vx - 70} 60 Z`} fill={"#5A2420"} />
          <path d={`M ${vx + 320} 60 Q ${vx + 270} 240 ${vx + 310} 420 L ${vx + 350} 420 L ${vx + 350} 60 Z`} fill={"#5A2420"} />
        </g>
      ))}
      <Retrato x={720} y={210} sem={sem + 300} />
      <Retrato x={1200} y={210} sem={sem + 301} />
      {/* reloj de pared y placa */}
      <g transform="translate(960 150)">
        <circle r={64} fill={C.laton} />
        <circle r={54} fill={"#F2ECDD"} />
        {Array.from({ length: 12 }).map((_, k) => (
          <rect key={k} x={-1.5} y={-50} width={3} height={9} fill={C.tinta} transform={`rotate(${k * 30})`} />
        ))}
        <rect x={-2} y={-34} width={4} height={36} fill={C.tinta} transform={`rotate(${f * 0.6 + 10})`} />
        <rect x={-1.5} y={-46} width={3} height={48} fill={C.carmin} transform={`rotate(${f * 6})`} />
      </g>
      {placa ? (
        <g transform="translate(960 300)">
          <rect x={-230} y={-34} width={460} height={64} fill={C.laton} />
          <rect x={-222} y={-26} width={444} height={48} fill="none" stroke={C.latonOsc} strokeWidth={2} />
          <T x={0} y={8} tam={placa.length > 24 ? 20 : 26} fam="serif" color={"#3A2A12"} esp={3}>
            {placa}
          </T>
        </g>
      ) : null}
      {/* lampara de techo */}
      <g transform="translate(960 0)">
        <rect x={-3} y={-40} width={6} height={60} fill={C.latonOsc} />
        <ellipse cx={0} cy={30} rx={120} ry={22} fill={C.laton} />
        {[-90, -45, 0, 45, 90].map((lx) => (
          <circle key={lx} cx={lx} cy={40} r={10} fill={"#F6E3A8"} />
        ))}
        <ellipse cx={0} cy={60} rx={500} ry={200} fill="url(#crk-lampara)" />
      </g>
      {/* suelo */}
      <rect x={-200} y={660} width={2320} height={600} fill={"#5A2A24"} />
      <rect x={-200} y={660} width={2320} height={14} fill={C.maderaOsc} />
      {/* consejeros al fondo de la mesa, de frente */}
      {Array.from({ length: n }).map((_, i) => {
        const k = sem * 10 + i;
        const x = 960 + (i - (n - 1) / 2) * 200;
        return (
          <g key={i}>
            <rect x={x - 70} y={560} width={140} height={190} rx={20} fill={"#3A1E18"} />
            <Figura
              x={x}
              y={840}
              escala={0.7}
              semilla={k}
              atuendo="banquero"
              gorro="ninguno"
              cuerpo="busto"
              largo={300}
              pose={i === Math.floor(n / 2) ? "habla" : rr(k, 2) > 0.6 ? "escribe" : "quieto"}
              gesto={tenso ? (rr(k, 3) > 0.5 ? "inquieto" : "serio") : "serio"}
              mirada={x < 960 ? 0.6 : -0.6}
              rasgos={{ edad: rr(k, 4) > 0.4 ? "mayor" : "maduro" }}
            />
          </g>
        );
      })}
      {/* la mesa larga */}
      <path d="M 120 760 L 1800 760 L 1900 880 L 20 880 Z" fill={C.maderaOsc} />
      <path d="M 120 760 L 1800 760 L 1810 772 L 110 772 Z" fill={C.maderaLuz} />
      <rect x={20} y={880} width={1880} height={40} fill={"#2A1A12"} />
      {/* papeles, ceniceros con puro, jarra, telefono */}
      {Array.from({ length: n }).map((_, i) => {
        const x = 960 + (i - (n - 1) / 2) * 200;
        return (
          <g key={i}>
            <path d={`M ${x - 60} 800 L ${x + 30} 796 L ${x + 40} 830 L ${x - 54} 836 Z`} fill={"#F2ECDD"} />
            {[0, 1, 2].map((l) => (
              <rect key={l} x={x - 48} y={806 + l * 8} width={70 - l * 10} height={3} fill={"#B6AD96"} />
            ))}
            {i % 2 === 0 ? (
              <g>
                <ellipse cx={x + 70} cy={812} rx={22} ry={7} fill={"#8E8270"} />
                <rect x={x + 60} y={804} width={34} height={6} rx={3} fill={"#6E4A2E"} />
                <Humo x={x + 92} y={800} s={0.22} color={"#D9D2BF"} n={5} />
              </g>
            ) : null}
          </g>
        );
      })}
      <g transform="translate(1680 800)">
        <rect x={-8} y={-60} width={16} height={60} fill={"#1A1A1A"} />
        <ellipse cx={0} cy={0} rx={30} ry={8} fill={"#1A1A1A"} />
        <circle cx={0} cy={-66} r={14} fill={"#1A1A1A"} />
        <rect x={12} y={-56} width={8} height={40} fill={"#1A1A1A"} />
      </g>
      <g transform="translate(300 790)">
        <path d="M -20 0 L -16 -60 Q 0 -70 16 -60 L 20 0 Z" fill={"#CFE0DC"} opacity={0.6} />
        <ellipse cx={0} cy={0} rx={22} ry={6} fill={"#AFC2BC"} />
      </g>
      {/* de espaldas, en primer termino */}
      {[0, 1, 2].map((i) => (
        <Espalda key={i} x={460 + i * 500} y={1200} escala={1.3} semilla={sem * 20 + i} atuendo="banquero" gorro="ninguno" />
      ))}
    </g>
  );
};

export const CONSEJO: Decorado = {
  desc: "Sala del consejo de un gran banco (o de la Reserva Federal): paneles de madera, ventanales con cortinas, retratos, reloj, lampara de techo, mesa larga con papeles, puros humeando y banqueros de traje oscuro.",
  admite: "textos.placa (placa de laton en la pared: p. ej. '23 WALL STREET' o 'FEDERAL RESERVE BANK OF NEW YORK'); variante 'crisis' (caras de preocupacion); gente; semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "la sala y la mesa del consejo" },
    cabecera: { de: { x: 960, y: 620, z: 2.1 }, a: { x: 960, y: 620, z: 2.4 }, desc: "el banquero que habla en el centro" },
    mesa: { de: { x: 700, y: 760, z: 2.4 }, a: { x: 820, y: 760, z: 2.6 }, desc: "papeles, puros y manos sobre la mesa" },
    placa: { de: { x: 960, y: 250, z: 2.2 }, a: { x: 960, y: 260, z: 2.5 }, desc: "el reloj y la placa de la pared" },
    consejeros: { de: { x: 620, y: 640, z: 1.8 }, a: { x: 1300, y: 640, z: 1.8 }, desc: "barrido por las caras de los consejeros" },
  },
  dibujo: DibujoConsejo,
};

/* ------------------------------------------------------------------ */
/* Dentro del banco: ventanillas con rejilla, cajeros y la camara      */
/* ------------------------------------------------------------------ */

const DibujoVentanilla: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const sem = e.semilla ?? 14;
  const panico = e.variante === "panico";
  const gente = e.gente ?? (panico ? 1 : 0.5);
  const cartel = e.textos?.cartel ?? "TELLER";
  const t = suave(f / Math.max(1, dur));
  const MOSTRADOR = 760;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1500} fill={"#E4DCCB"} />
      {/* pilastras de marmol y techo artesonado */}
      <rect x={-200} y={-200} width={2320} height={260} fill={"#CFC4AC"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-180 + i * 200} y={-180} width={170} height={210} fill={"#DCD2BC"} />
      ))}
      {[100, 700, 1220, 1820].map((x) => (
        <g key={x}>
          <rect x={x - 40} y={60} width={80} height={MOSTRADOR} fill={"#D9CFB8"} />
          <rect x={x - 50} y={60} width={100} height={30} fill={"#C8BDA4"} />
        </g>
      ))}
      {/* camara acorazada al fondo */}
      <g transform="translate(960 380)">
        <rect x={-210} y={-230} width={420} height={420} fill={"#8C8068"} />
        <circle r={180} fill={"#6E706A"} />
        <circle r={150} fill={"#8A8C86"} />
        <circle r={150} fill="none" stroke={"#5E605A"} strokeWidth={6} />
        <g transform={`rotate(${f * 0.6})`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={-6} y={-110} width={12} height={90} rx={6} fill={"#C9C6BC"} transform={`rotate(${i * 60})`} />
          ))}
        </g>
        <circle r={30} fill={C.laton} />
        {Array.from({ length: 12 }).map((_, i) => (
          <circle key={i} cx={Math.cos((i * Math.PI) / 6) * 165} cy={Math.sin((i * Math.PI) / 6) * 165} r={7} fill={"#5E605A"} />
        ))}
      </g>
      {/* reloj */}
      <g transform="translate(400 200)">
        <circle r={70} fill={C.laton} />
        <circle r={60} fill={"#F2ECDD"} />
        <rect x={-2} y={-40} width={4} height={42} fill={C.tinta} transform={`rotate(${300 + f * 0.1})`} />
        <rect x={-1.5} y={-54} width={3} height={56} fill={C.carmin} transform={`rotate(${f * 6})`} />
      </g>
      {/* cajeros tras la rejilla */}
      {[0, 1, 2, 3].map((i) => {
        const x = 330 + i * 420;
        return (
          <g key={i}>
            <Figura x={x} y={MOSTRADOR + 40} escala={0.72} semilla={sem * 5 + i} atuendo="banquero" gorro="ninguno" cuerpo="busto" largo={200} pose={i === 1 ? "escribe" : "quieto"} gesto={panico ? "inquieto" : "neutro"} mirada={0.2} rasgos={{ gafas: i % 2 === 0 }} />
          </g>
        );
      })}
      {/* mostrador de marmol con las rejillas de laton */}
      <rect x={-200} y={MOSTRADOR - 300} width={2320} height={40} fill={C.maderaOsc} />
      {[0, 1, 2, 3].map((i) => {
        const x = 330 + i * 420;
        return (
          <g key={i}>
            <rect x={x - 170} y={MOSTRADOR - 260} width={340} height={260} fill="none" />
            {Array.from({ length: 15 }).map((_, b) => (
              <rect key={b} x={x - 160 + b * 22} y={MOSTRADOR - 260} width={3} height={180} fill={C.laton} opacity={0.9} />
            ))}
            <path d={`M ${x - 160} ${MOSTRADOR - 160} Q ${x} ${MOSTRADOR - 230} ${x + 160} ${MOSTRADOR - 160}`} fill="none" stroke={C.laton} strokeWidth={4} />
            <rect x={x - 70} y={MOSTRADOR - 80} width={140} height={80} fill={"#2A2420"} opacity={0.15} />
            <rect x={x - 110} y={MOSTRADOR - 300} width={220} height={36} fill={"#2A2420"} />
            <T x={x} y={MOSTRADOR - 274} tam={20} color={C.laton} esp={4}>
              {i === 0 && e.textos?.cartel ? cartel : ["TELLER", "TELLER", "RECEIVING", "PAYING"][i]}
            </T>
          </g>
        );
      })}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={110 + i * 420} y={MOSTRADOR - 260} width={20} height={260} fill={"#B9AE96"} />
      ))}
      <rect x={-200} y={MOSTRADOR} width={2320} height={30} fill={"#E9E2D2"} />
      <rect x={-200} y={MOSTRADOR + 30} width={2320} height={260} fill={"#C9BDA2"} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-180 + i * 200} y={MOSTRADOR + 60} width={160} height={190} fill="none" stroke={"#B9AE96"} strokeWidth={4} />
      ))}
      {/* billetes sobre el mostrador: una mano cuenta */}
      <g transform={`translate(750 ${MOSTRADOR + 6})`}>
        <rect x={-60} y={-14} width={110} height={16} fill={"#9DB08A"} />
        {Array.from({ length: 8 }).map((_, k) => (
          <rect key={k} x={-60} y={-14 - k * 3} width={110} height={4} fill={k % 2 ? "#A9BA94" : "#8FA27C"} />
        ))}
        {Array.from({ length: Math.floor(t * 9) }).map((_, k) => (
          <rect key={k} x={80 + (k % 3) * 2} y={-8 - k * 3} width={110} height={4} fill={k % 2 ? "#A9BA94" : "#8FA27C"} transform={`rotate(${(k % 3) - 1} 135 ${-8 - k * 3})`} />
        ))}
        <g transform={`translate(${60 + Math.sin(f * 0.5) * 30} -30)`}>
          <ellipse cx={0} cy={0} rx={26} ry={16} fill={"#D6A47E"} />
          <rect x={-40} y={-10} width={24} height={20} rx={6} fill={"#E9E2D2"} />
        </g>
      </g>
      {/* clientes de espaldas ante las ventanillas */}
      {Array.from({ length: Math.round(8 * gente) + 2 }).map((_, i) => {
        const k = sem * 30 + i;
        return <Espalda key={i} x={120 + i * (1700 / (Math.round(8 * gente) + 2)) + rr(k, 1) * 40} y={1110 + (i % 2) * 40} escala={1.05 + (i % 2) * 0.1} semilla={k} atuendo={rr(k, 2) > 0.6 ? "mujer" : "traje"} giro={panico ? Math.sin(f * 0.1 + i) * 4 : 0} />;
      })}
    </g>
  );
};

export const VENTANILLA: Decorado = {
  desc: "Dentro de un banco: vestibulo de marmol, la puerta redonda de la camara acorazada, reloj de pared, ventanillas con rejilla de laton y cajeros, billetes contados sobre el mostrador y clientes de espaldas.",
  admite: "textos.cartel (rotulo de la primera ventanilla); variante 'panico' (mas gente, cajeros inquietos); gente; semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "el vestibulo, las ventanillas y la camara" },
    ventanilla: { de: { x: 760, y: 560, z: 2.0 }, a: { x: 760, y: 590, z: 2.3 }, desc: "una ventanilla con su cajero tras la rejilla" },
    billetes: { de: { x: 800, y: 740, z: 3.6 }, a: { x: 800, y: 740, z: 4.0 }, desc: "billetes contados sobre el mostrador" },
    camara: { de: { x: 960, y: 380, z: 2.1 }, a: { x: 960, y: 380, z: 2.4 }, desc: "la puerta de la camara acorazada" },
    clientes: { de: { x: 960, y: 780, z: 1.6 }, a: { x: 1060, y: 780, z: 1.7 }, desc: "los clientes ante las ventanillas" },
  },
  dibujo: DibujoVentanilla,
};

/* ------------------------------------------------------------------ */
/* Roosevelt: el despacho con los microfonos de la radio               */
/* ------------------------------------------------------------------ */

const Microfono: React.FC<{ x: number; y: number; s?: number; letra: string }> = ({ x, y, s = 1, letra }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-4} y={-120} width={8} height={120} fill={"#2A2A28"} />
    <ellipse cx={0} cy={0} rx={30} ry={8} fill={"#2A2A28"} />
    <rect x={-26} y={-190} width={52} height={70} rx={14} fill={"#4A4A46"} />
    {Array.from({ length: 5 }).map((_, i) => (
      <rect key={i} x={-20} y={-180 + i * 12} width={40} height={4} fill={"#2A2A28"} />
    ))}
    <rect x={-30} y={-210} width={60} height={24} fill={"#C9A23A"} />
    <T x={0} y={-192} tam={14} color={"#2A2A28"}>
      {letra}
    </T>
  </g>
);

const DibujoRoosevelt: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 15;
  const firma = e.variante === "firma";
  const doc = e.textos?.documento ?? "";
  const fdr = { edad: "maduro" as const, gafas: true, bigote: "ninguno" as const, barba: "ninguna" as const, peinado: "raya" as const, pelo: "#7A6A5C", piel: "#E2B892" };
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1500} fill={"#C9C0A8"} />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={-200 + i * 80} y={-200} width={4} height={900} fill={"#BDB399"} />
      ))}
      <rect x={-200} y={640} width={2320} height={600} fill={"#4A3A30"} />
      <rect x={-200} y={620} width={2320} height={24} fill={"#E9E2D2"} />
      {/* ventanas con cortinas verdes y luz */}
      {[120, 1500].map((vx) => (
        <g key={vx}>
          <Ventana x={vx} y={100} w={260} h={380} marco={"#E9E2D2"} cristal={e.hora === "noche" ? "#2A3442" : "#D9DFD8"} />
          <path d={`M ${vx - 40} 70 Q ${vx + 10} 280 ${vx - 30} 520 L ${vx - 70} 520 L ${vx - 70} 70 Z`} fill={"#3E5A4A"} />
          <path d={`M ${vx + 300} 70 Q ${vx + 250} 280 ${vx + 290} 520 L ${vx + 330} 520 L ${vx + 330} 70 Z`} fill={"#3E5A4A"} />
        </g>
      ))}
      {/* banderas tras la mesa */}
      <BanderaUSA x={620} y={120} s={1.1} mastil={520} />
      <g transform="translate(1280 120)">
        <rect x={-5} y={0} width={8} height={520} fill={"#2A2E30"} />
        <circle cx={-1} cy={-4} r={7} fill={C.laton} />
        <path d={`M 3 6 Q 70 ${6 + Math.sin(f * 0.15 + 2) * 6} 160 6 L 160 120 Q 70 ${120 + Math.sin(f * 0.15 + 2) * 6} 3 120 Z`} fill={"#23365E"} />
        <circle cx={82} cy={62} r={30} fill={"#E9E2D2"} opacity={0.85} />
        <circle cx={82} cy={62} r={18} fill={C.laton} opacity={0.8} />
      </g>
      {/* estanteria y retrato */}
      <rect x={830} y={110} width={260} height={300} fill={C.laton} />
      <rect x={842} y={122} width={236} height={276} fill={"#5E6A5A"} />
      <path d="M 842 330 Q 900 280 960 310 Q 1020 270 1078 300 L 1078 398 L 842 398 Z" fill={"#4A5446"} />
      {/* Roosevelt detras de la mesa */}
      <Figura x={960} y={820} escala={1.05} semilla={1933} atuendo="traje" gorro="ninguno" traje={"#2F3236"} rasgos={fdr} cuerpo="busto" largo={300} pose={firma ? "escribe" : "habla"} habla={!firma} gesto="neutro" mirada={0} />
      {firma ? (
        <g>
          {[680, 1240, 560, 1360].map((x, i) => (
            <Figura key={i} x={x} y={860} escala={0.86} semilla={sem * 7 + i} atuendo="banquero" gorro="ninguno" cuerpo="busto" largo={300} gesto="serio" mirada={x < 960 ? 0.6 : -0.6} rasgos={{ edad: i % 2 ? "mayor" : "maduro" }} />
          ))}
        </g>
      ) : null}
      {/* la mesa */}
      <rect x={300} y={700} width={1320} height={40} fill={C.maderaLuz} />
      <rect x={320} y={740} width={1280} height={300} fill={C.madera} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={360 + k * 420} y={780} width={360} height={220} fill="none" stroke={C.maderaLuz} strokeWidth={4} />
      ))}
      {firma ? (
        <g>
          <path d="M 840 690 L 1080 684 L 1096 716 L 830 722 Z" fill={"#F2ECDD"} />
          <T x={962} y={705} tam={12} fam="serif" color={C.tinta}>
            {doc}
          </T>
          <g transform={`translate(${1000 + Math.sin(f * 0.3) * 20} 700) rotate(-30)`}>
            <rect x={-3} y={-60} width={6} height={60} fill={"#1A1A1A"} />
          </g>
        </g>
      ) : (
        <g>
          <Microfono x={760} y={704} s={0.9} letra="RADIO" />
          <Microfono x={1160} y={704} s={0.9} letra="RADIO" />
          <Microfono x={960} y={704} s={0.75} letra="RADIO" />
          <path d="M 840 696 L 1080 690 L 1090 712 L 834 718 Z" fill={"#F2ECDD"} />
          {[0, 1, 2].map((k) => {
            const tt = (f * 0.02 + k / 3) % 1;
            return <circle key={k} cx={960} cy={540} r={60 + tt * 260} fill="none" stroke={"#F2E2B4"} strokeWidth={3} opacity={(1 - tt) * 0.35} />;
          })}
        </g>
      )}
      {/* tintero y vaso */}
      <rect x={480} y={670} width={60} height={30} fill={"#2A2A28"} />
      <rect x={1420} y={650} width={36} height={52} fill={"#CFE0DC"} opacity={0.6} />
    </g>
  );
};

export const ROOSEVELT: Decorado = {
  desc: "Despacho de la Casa Blanca, 1933: Franklin D. Roosevelt (gafas, traje oscuro) habla tras una mesa con tres microfonos de radio, entre la bandera de Estados Unidos y la presidencial. Variante 'firma': firma una ley con legisladores de pie detras.",
  admite: "variante 'firma' (firma un documento; textos.documento: titulo pequeno en el papel); hora; semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "el despacho, la mesa y las banderas" },
    microfonos: { de: { x: 960, y: 560, z: 1.8 }, a: { x: 960, y: 560, z: 2.05 }, desc: "Roosevelt ante los microfonos" },
    cara: { de: { x: 960, y: 420, z: 3.0 }, a: { x: 960, y: 420, z: 3.4 }, desc: "primer plano de Roosevelt" },
    mesa: { de: { x: 960, y: 690, z: 3.0 }, a: { x: 960, y: 690, z: 3.3 }, desc: "el papel sobre la mesa (y la pluma si firma)" },
    bandera: { de: { x: 700, y: 360, z: 1.8 }, a: { x: 760, y: 380, z: 1.9 }, desc: "la bandera y Roosevelt a un lado" },
  },
  dibujo: DibujoRoosevelt,
};

/* ------------------------------------------------------------------ */
/* 2026: pantallas de bolsa y un movil con graficos                    */
/* ------------------------------------------------------------------ */

const Grafico: React.FC<{ x: number; y: number; w: number; h: number; sem: number; f: number; color?: string; velas?: boolean }> = ({ x, y, w, h, sem, f, color = "#5FC28E", velas }) => {
  const n = 40;
  const pts = Array.from({ length: n }).map((_, i) => {
    let v = 0.5;
    for (let k = 0; k <= i; k++) v += (rr(k, sem) - 0.49) * 0.07;
    return Math.max(0.05, Math.min(0.95, v));
  });
  const vis = Math.min(n, 12 + Math.floor(f / 6));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={"#0E1418"} />
      {[0.25, 0.5, 0.75].map((k) => (
        <rect key={k} x={x} y={y + h * k} width={w} height={1.5} fill={"#22303A"} />
      ))}
      {velas
        ? pts.slice(0, vis).map((p, i) => {
            const prev = i ? pts[i - 1] : p;
            const sube = p <= prev;
            const cx = x + (i / n) * w + 4;
            return (
              <g key={i}>
                <rect x={cx + 3} y={y + Math.min(p, prev) * h - 8} width={2} height={Math.abs(p - prev) * h + 16} fill={sube ? "#5FC28E" : "#E06A55"} />
                <rect x={cx} y={y + Math.min(p, prev) * h} width={8} height={Math.max(3, Math.abs(p - prev) * h)} fill={sube ? "#5FC28E" : "#E06A55"} />
              </g>
            );
          })
        : (
          <path d={pts.slice(0, vis).map((p, i) => `${i ? "L" : "M"} ${x + (i / (n - 1)) * w} ${y + p * h}`).join(" ")} fill="none" stroke={color} strokeWidth={3} />
        )}
    </g>
  );
};

const DibujoModerno: React.FC<PropsDecorado> = ({ e, f, dur }) => {
  const sem = e.semilla ?? 16;
  const v = e.valores ?? [];
  const t = suave(f / Math.max(1, dur * 0.8));
  const cifra = e.textos?.cifra ?? (v.length >= 2 ? miles(interpolate(t, [0, 1], [v[0], v[1]]), Number.isInteger(v[1]) ? 0 : 1) : v.length === 1 ? miles(v[0], Number.isInteger(v[0]) ? 0 : 1) : "");
  const etiqueta = e.textos?.etiqueta ?? "";
  const cinta = e.textos?.cinta ?? "";
  const desliza = (f * 3) % 3000;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-200} width={2320} height={1500} fill={"#1A2026"} />
      {/* ventanal con la ciudad al anochecer */}
      <rect x={-200} y={-200} width={2320} height={500} fill={"#3A4A5A"} />
      {Array.from({ length: 24 }).map((_, i) => (
        <g key={i}>
          <rect x={-180 + i * 100} y={300 - 120 - rr(i, 3) * 240} width={80} height={600} fill={"#2A3442"} />
          {Array.from({ length: 6 }).map((__, k) => (
            <rect key={k} x={-170 + i * 100 + (k % 2) * 36} y={300 - 100 - rr(i, 3) * 240 + Math.floor(k / 2) * 40} width={22} height={14} fill={"#E9C77A"} opacity={rr(i * 6 + k, 5) > 0.5 ? 0.8 : 0.1} />
          ))}
        </g>
      ))}
      {/* muro de pantallas */}
      <rect x={140} y={100} width={1640} height={560} fill={"#0A0E12"} />
      <Grafico x={160} y={120} w={520} h={250} sem={sem} f={f} velas />
      <Grafico x={700} y={120} w={520} h={250} sem={sem + 1} f={f} color={"#E8B33C"} />
      <Grafico x={1240} y={120} w={520} h={250} sem={sem + 2} f={f} velas />
      <rect x={160} y={390} width={1600} height={250} fill={"#0E1418"} />
      {cifra ? (
        <g>
          <T x={960} y={470} tam={34} color={"#9AA8B4"} esp={6}>
            {etiqueta}
          </T>
          <T x={960} y={590} tam={110} color={"#F2ECDD"} fam="mono">
            {cifra}
          </T>
        </g>
      ) : (
        <Grafico x={160} y={390} w={1600} h={250} sem={sem + 3} f={f} color={"#5FC28E"} />
      )}
      {/* banda de cotizaciones */}
      <rect x={140} y={668} width={1640} height={40} fill={"#0A0E12"} />
      <clipPath id="crk-banda26">
        <rect x={140} y={668} width={1640} height={40} />
      </clipPath>
      <g clipPath="url(#crk-banda26)">
        {cinta ? (
          <T x={600 - ((f * 2.5) % 3000)} y={698} tam={26} fam="mono" color={"#E8B33C"} anc="start" esp={3}>
            {cinta + "     " + cinta}
          </T>
        ) : (
          Array.from({ length: 30 }).map((_, i) => (
            <rect key={i} x={140 + ((i * 110 - desliza * 0.5 + 6000) % 1700) - 50} y={680} width={60 + (i % 3) * 12} height={16} fill={i % 3 ? "#5FC28E" : "#E06A55"} opacity={0.6} />
          ))
        )}
      </g>
      {/* mesas con monitores y operadores de espaldas */}
      <rect x={-200} y={760} width={2320} height={600} fill={"#2A3038"} />
      {[0, 1, 2, 3].map((i) => {
        const x = 200 + i * 460;
        return (
          <g key={i}>
            <rect x={x - 150} y={760} width={140} height={90} fill={"#0E1418"} stroke={"#4A525A"} strokeWidth={4} />
            <rect x={x + 10} y={760} width={140} height={90} fill={"#0E1418"} stroke={"#4A525A"} strokeWidth={4} />
            <Grafico x={x - 144} y={766} w={128} h={78} sem={sem + i * 3} f={f} velas />
            <Grafico x={x + 16} y={766} w={128} h={78} sem={sem + i * 3 + 1} f={f} color={"#E8B33C"} />
            <rect x={x - 6} y={850} width={12} height={20} fill={"#4A525A"} />
            <rect x={x - 180} y={866} width={360} height={22} fill={"#C9CFD4"} />
            <rect x={x - 180} y={888} width={360} height={300} fill={"#3A424A"} />
            <Espalda x={x + (i % 2 ? 40 : -40)} y={1080} escala={0.95} semilla={sem * 9 + i} atuendo={i % 2 ? "moderna" : "moderno"} gorro="ninguno" />
          </g>
        );
      })}
      <Figura x={260} y={1240} escala={1.05} semilla={sem * 9 + 7} atuendo="moderno" gorro="ninguno" traje={"#2A2E34"} cuerpo="busto" pose="movil" mirada={0.5} gesto="serio" />
      {/* el movil en primer plano */}
      <g transform="translate(1660 900) rotate(-8)">
        <ellipse cx={20} cy={160} rx={110} ry={70} fill={"#C38E68"} />
        <rect x={-110} y={-260} width={230} height={440} rx={30} fill={"#15191C"} />
        <rect x={-98} y={-240} width={206} height={400} rx={20} fill={"#0E1418"} />
        <Grafico x={-90} y={-170} w={190} h={150} sem={sem + 9} f={f} color={"#5FC28E"} />
        <rect x={-90} y={-220} width={120} height={14} fill={"#9AA8B4"} />
        <rect x={-90} y={0} width={190} height={30} rx={8} fill={"#22303A"} />
        <rect x={-90} y={40} width={190} height={30} rx={8} fill={"#22303A"} />
        <rect x={-90} y={80} width={190} height={30} rx={8} fill={"#22303A"} />
        <ellipse cx={-110} cy={60} rx={30} ry={60} fill={"#C38E68"} />
      </g>
    </g>
  );
};

export const MODERNO: Decorado = {
  desc: "Una sala de mercados en 2026: muro de pantallas con graficos de velas y lineas que se dibujan, banda de cotizaciones, ventanal con rascacielos iluminados, operadores en sus mesas y un movil con un grafico en primer plano.",
  admite: "textos.cifra o valores [de, a] (cifra grande en la pantalla central), textos.etiqueta (lo que es esa cifra, encima), textos.cinta (texto de la banda); semilla",
  tomas: {
    general: { de: { x: 960, y: 540, z: 1 }, a: { x: 960, y: 560, z: 1.08 }, desc: "la sala con el muro de pantallas" },
    pantalla: { de: { x: 960, y: 500, z: 1.7 }, a: { x: 960, y: 520, z: 1.9 }, desc: "la pantalla central con la cifra" },
    graficos: { de: { x: 500, y: 250, z: 2.4 }, a: { x: 1400, y: 250, z: 2.4 }, desc: "barrido por los graficos" },
    movil: { de: { x: 1600, y: 820, z: 2.2 }, a: { x: 1620, y: 800, z: 2.6 }, desc: "el movil con el grafico" },
    mesa: { de: { x: 660, y: 820, z: 2.0 }, a: { x: 700, y: 820, z: 2.2 }, desc: "operadores ante sus monitores" },
  },
  dibujo: DibujoModerno,
};
