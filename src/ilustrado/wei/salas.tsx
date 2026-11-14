import React from "react";
import { useCurrentFrame } from "remotion";
import type { Rasgos } from "../../piloto/Personajes";
import type { Decorado, PropsDecorado } from "../tipos";
import { Defs, FUENTE, Humo, Lampara, Reloj, SueloInterior, VentanaInterior, W, oscurecer, rr, toma } from "./base";
import { Andante, Figura } from "./gente";
import { Bandera, FRANCIA, WEIMAR } from "./exteriores";

/** Arana de cristal que destella. */
const Arana: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2} y={-300} width={4} height={300} fill={W.laton} />
      <ellipse cx={0} cy={0} rx={110} ry={20} fill={W.laton} />
      <ellipse cx={0} cy={-40} rx={70} ry={14} fill={W.laton} />
      {Array.from({ length: 9 }).map((_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const bx = Math.cos(a) * 100;
        return (
          <g key={i}>
            <rect x={bx - 3} y={-24} width={6} height={20} fill={"#F2ECDD"} />
            <ellipse cx={bx} cy={-30} rx={4} ry={7} fill={"#FFE7AE"} opacity={0.7 + 0.3 * Math.sin(f * 0.3 + i)} />
            <path d={`M ${bx} 4 L ${bx - 4} 30 L ${bx} 40 L ${bx + 4} 30 Z`} fill={"#E9EEF0"} opacity={0.85} />
          </g>
        );
      })}
      <circle cx={0} cy={20} r={240} fill="url(#w-lampara)" />
    </g>
  );
};

/* ------------------------------------------------------------------ */
/* Sala de conferencias                                                */
/* ------------------------------------------------------------------ */

const Conferencia: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 23;
  const v = e.variante ?? "versalles";
  const documento = e.textos?.documento ?? "Friedensvertrag";
  const espejos = v === "versalles";
  const gabinete = v === "gabinete";
  const n = gabinete ? 5 : 7;
  const pared = espejos ? "#D9C9A0" : gabinete ? "#5E4A38" : "#6E5A44";
  const firma = Math.min(1, Math.max(0, (f - 40) / 120));
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill={pared} />
      {/* arcos con espejos o paneles */}
      {Array.from({ length: 5 }).map((_, i) => {
        const ax = 40 + i * 380;
        return (
          <g key={i}>
            <path d={`M ${ax} 640 L ${ax} 160 Q ${ax + 150} 40 ${ax + 300} 160 L ${ax + 300} 640 Z`} fill={espejos ? "#C9D3D0" : oscurecer(pared, 0.85)} />
            {espejos
              ? Array.from({ length: 4 }).map((_, k) => <rect key={k} x={ax} y={200 + k * 110} width={300} height={4} fill={W.laton} />)
              : <path d={`M ${ax + 30} 610 L ${ax + 30} 190 Q ${ax + 150} 100 ${ax + 270} 190 L ${ax + 270} 610 Z`} fill="none" stroke={W.laton} strokeWidth={3} opacity={0.5} />}
            {espejos ? <path d={`M ${ax + 40} 600 L ${ax + 120} 200`} stroke={"#FFFFFF"} strokeWidth={14} opacity={0.25} /> : null}
            <path d={`M ${ax} 640 L ${ax} 160 Q ${ax + 150} 40 ${ax + 300} 160 L ${ax + 300} 640`} fill="none" stroke={W.laton} strokeWidth={8} />
            <rect x={ax + 310} y={60} width={60} height={600} fill={espejos ? "#E6D8B0" : oscurecer(pared, 1.1)} />
          </g>
        );
      })}
      {gabinete ? (
        <g>
          <Bandera x={1700} y={150} franjas={WEIMAR} w={130} h={84} mastil={500} />
        </g>
      ) : (
        <g>
          <Bandera x={150} y={180} franjas={FRANCIA} vertical w={120} h={80} mastil={480} fase={1} />
          <Bandera x={1760} y={180} franjas={["#2F3A6A", "#F2EFE6", "#C8402C"]} w={120} h={80} mastil={480} fase={2} />
        </g>
      )}
      <Arana x={560} y={170} s={0.9} />
      <Arana x={1360} y={170} s={0.9} />
      <SueloInterior y={860} tipo="parquet" />
      {/* delegados */}
      {Array.from({ length: n }).map((_, i) => {
        const centro = i === Math.floor(n / 2);
        const x = 260 + i * (1400 / (n - 1));
        return (
          <Figura
            key={i}
            x={x}
            y={centro ? 880 : 950}
            escala={centro ? 1 : 0.86}
            semilla={s * 3 + i}
            ropa={i % 3 === 0 ? "abrigo" : "traje"}
            tocado="ninguno"
            cuerpo={centro ? "entero" : "busto"}
            pose={centro ? "habla" : i % 3 === 1 ? "mesa" : i % 3 === 2 ? "escribe" : "brazos"}
            mirada={centro ? 0 : x < 960 ? 0.6 : -0.6}
            gesto={centro ? "serio" : (["neutro", "serio", "inquieto"] as const)[i % 3]}
          />
        );
      })}
      {/* mesa larga con pano verde */}
      <g>
        <rect x={100} y={740} width={1720} height={220} fill={"#2F4A3F"} />
        <rect x={100} y={730} width={1720} height={20} fill={"#3E5E50"} />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M ${160 + i * 140} 760 Q ${170 + i * 140} 860 ${150 + i * 140} 960`} stroke={"#26403A"} strokeWidth={4} fill="none" />
        ))}
        <rect x={100} y={940} width={1720} height={20} fill={"#22382F"} />
        {/* papeles, tinteros y jarras */}
        {Array.from({ length: n }).map((_, i) => {
          const x = 260 + i * (1400 / (n - 1));
          return (
            <g key={i}>
              <rect x={x - 50} y={722} width={90} height={14} fill={"#EFE7D2"} transform={`rotate(${(rr(i, s) - 0.5) * 8} ${x} 728)`} />
              <rect x={x + 50} y={714} width={18} height={18} fill={W.tinta} />
              <rect x={x + 58} y={692} width={3} height={24} fill={"#EFE7D2"} transform={`rotate(20 ${x + 58} 714)`} />
            </g>
          );
        })}
        {[600, 1320].map((jx) => (
          <path key={jx} d={`M ${jx - 16} 732 L ${jx - 20} 682 Q ${jx} 662 ${jx + 20} 682 L ${jx + 16} 732 Z`} fill={"#CFE0DE"} opacity={0.8} />
        ))}
        {/* documento principal */}
        <g transform="translate(960 690) rotate(-2)">
          <rect x={-140} y={-10} width={280} height={60} fill={"#F2ECDA"} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={documento.length > 16 ? 20 : 26} fill={W.tinta}>
            {documento}
          </text>
          <path d={`M -90 38 Q ${-90 + firma * 60} ${30 + Math.sin(firma * 20) * 4} ${-90 + firma * 150} 38`} stroke={"#1F2B5C"} strokeWidth={2.5} fill="none" />
          <circle cx={100} cy={36} r={12} fill={W.carmin} />
        </g>
      </g>
    </g>
  );
};

export const conferencia: Decorado = {
  desc: "Salon de conferencias: arcos con espejos o paneles, aranas de cristal, banderas, mesa larga con pano verde, tinteros y papeles; delegados sentados y uno de pie que habla en el centro; un documento sobre la mesa que se firma.",
  admite:
    "variante 'versalles' (galeria de espejos, banderas aliadas), 'londres' (paneles de madera, banderas aliadas), 'gabinete' (sala oscura del Gobierno aleman, bandera negro-rojo-oro, cinco ministros); textos.documento (titulo del documento, p. ej. 'Friedensvertrag', 'Londoner Ultimatum', 'Dawes-Plan')",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.06], "la sala entera"),
    orador: toma([960, 560, 2.2], [960, 520, 2.6], "el delegado que habla de pie"),
    delegados: toma([560, 640, 1.8], [700, 640, 1.9], "delegados sentados"),
    firma: toma([960, 700, 2.8], [960, 700, 3.2], "el documento y la firma"),
    sala: toma([960, 300, 1.4], [960, 330, 1.5], "las aranas y los arcos"),
  },
  dibujo: Conferencia,
};

/* ------------------------------------------------------------------ */
/* Despacho del banquero o del industrial                              */
/* ------------------------------------------------------------------ */

const RETRATOS: Record<string, { rasgos: Partial<Rasgos>; ropa: "traje" | "abrigo" }> = {
  havenstein: { rasgos: { edad: "mayor", peinado: "calvo", barba: "completa", bigote: "morsa", pelo: "#D9D4CC", gafas: false }, ropa: "abrigo" },
  stinnes: { rasgos: { edad: "maduro", peinado: "corto", barba: "completa", bigote: "morsa", pelo: "#2A201B", gafas: false, piel: "#D6A47E" }, ropa: "traje" },
  schacht: { rasgos: { edad: "maduro", peinado: "raya", barba: "ninguna", bigote: "fino", pelo: "#5E4330", gafas: true }, ropa: "traje" },
  erzberger: { rasgos: { edad: "maduro", peinado: "raya", barba: "ninguna", bigote: "manillar", pelo: "#3F2E24", gafas: true }, ropa: "traje" },
  luther: { rasgos: { edad: "maduro", peinado: "calvo", barba: "ninguna", bigote: "ninguno", pelo: "#7A5E44", gafas: true }, ropa: "traje" },
  rathenau: { rasgos: { edad: "maduro", peinado: "calvo", barba: "ninguna", bigote: "fino", pelo: "#3F2E24", gafas: false }, ropa: "abrigo" },
  stresemann: { rasgos: { edad: "maduro", peinado: "calvo", barba: "ninguna", bigote: "cepillo", pelo: "#5E4330", gafas: false }, ropa: "traje" },
  dawes: { rasgos: { edad: "maduro", peinado: "raya", barba: "ninguna", bigote: "ninguno", pelo: "#A8988A", gafas: false }, ropa: "traje" },
  keynes: { rasgos: { edad: "joven", peinado: "raya", barba: "ninguna", bigote: "cepillo", pelo: "#3F2E24", gafas: false }, ropa: "traje" },
  economista: { rasgos: { edad: "mayor", peinado: "raya", barba: "perilla", bigote: "fino", pelo: "#A8988A", gafas: true }, ropa: "traje" },
};

const Despacho: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 25;
  const v = e.variante ?? "havenstein";
  const ret = RETRATOS[v] ?? RETRATOS.havenstein;
  const documento = e.textos?.documento;
  const placa = e.textos?.placa;
  const cinta = (f * 2) % 400;
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill={"#4E3A2C"} />
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i}>
          <rect x={-160 + i * 260} y={60} width={220} height={480} rx={4} fill={"#5A4434"} />
          <rect x={-146 + i * 260} y={74} width={192} height={452} rx={3} fill="none" stroke={"#3E2C20"} strokeWidth={4} />
          <rect x={-160 + i * 260} y={580} width={220} height={280} rx={4} fill={"#5A4434"} />
        </g>
      ))}
      <rect x={-200} y={548} width={2320} height={20} fill={"#6E5240"} />
      <VentanaInterior x={1300} y={110} w={420} h={400} hora={e.hora} cortinas={"#2F4A3F"} fuera="fabrica" />
      {/* retrato colgado y caja fuerte */}
      <g transform="translate(250 150)">
        <rect x={-12} y={-12} width={244} height={304} fill={W.laton} />
        <rect x={0} y={0} width={220} height={280} fill={"#3A4A44"} />
        <circle cx={110} cy={110} r={56} fill={"#7E6A58"} />
        <rect x={50} y={170} width={120} height={110} fill={"#2A2E30"} />
      </g>
      <g transform="translate(180 860)">
        <rect x={0} y={-300} width={240} height={300} fill={"#3A4246"} />
        <rect x={16} y={-284} width={208} height={268} fill={"#4A5458"} />
        <circle cx={120} cy={-150} r={44} fill={"#2A2E30"} />
        <g transform={`rotate(${Math.sin(f * 0.05) * 30} 120 -150)`}>
          <rect x={116} y={-190} width={8} height={40} fill={W.laton} />
        </g>
        <rect x={190} y={-170} width={14} height={40} fill={W.laton} />
      </g>
      <Reloj x={1050} y={200} r={52} />
      <Lampara x={960} y={30} largo={80} tipo="tulipa" />
      <SueloInterior y={860} tipo="parquet" />
      {/* el personaje */}
      <Figura x={960} y={900} escala={1.25} semilla={s + 7} ropa={ret.ropa} tocado="ninguno" rasgos={ret.rasgos} cuerpo="busto" pose={documento ? "lee" : "habla"} mirada={0.1} gesto="serio" />
      {/* escritorio */}
      <g>
        <rect x={500} y={740} width={920} height={240} fill={W.madera} />
        <rect x={480} y={720} width={960} height={30} fill={"#7A5A3E"} />
        <rect x={560} y={712} width={800} height={10} fill={"#2F4A3F"} />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={530 + k * 300} y={780} width={260} height={150} rx={4} fill="none" stroke={"#3A2A1E"} strokeWidth={4} />
        ))}
        {/* telefono de candelero */}
        <g transform="translate(600 712)">
          <ellipse cx={0} cy={0} rx={30} ry={8} fill={W.hierro} />
          <rect x={-6} y={-100} width={12} height={100} fill={W.hierro} />
          <ellipse cx={0} cy={-104} rx={18} ry={10} fill={W.hierro} />
          <rect x={26} y={-90} width={12} height={60} rx={6} fill={W.hierro} transform="rotate(10 32 -60)" />
        </g>
        {/* teletipo bajo campana */}
        <g transform="translate(1300 712)">
          <rect x={-50} y={-30} width={100} height={30} fill={W.madera} />
          <path d="M -40 -30 L -40 -110 Q 0 -150 40 -110 L 40 -30 Z" fill={"#CFE0DE"} opacity={0.5} />
          <circle cx={0} cy={-70} r={18} fill={W.laton} />
          <path d={`M 10 -60 Q 60 -20 80 ${0} L ${80 + cinta * 0.1} 8`} stroke={"#F2ECDA"} strokeWidth={6} fill="none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={20 + ((i * 30 + cinta) % 160)} y={4} width={16} height={4} fill={W.tinta} opacity={0.6} />
          ))}
        </g>
        {/* papeles, tintero y globo */}
        <rect x={700} y={696} width={160} height={20} fill={"#EFE7D2"} transform="rotate(-4 780 706)" />
        <rect x={1060} y={690} width={30} height={24} fill={W.tinta} />
        {placa ? (
          <g transform="translate(960 790)">
            <rect x={-140} y={-24} width={280} height={48} fill={W.laton} />
            <text x={0} y={10} textAnchor="middle" fontFamily={FUENTE.serif} fontSize={26} letterSpacing={3} fill={W.tinta}>
              {placa}
            </text>
          </g>
        ) : null}
      </g>
      {documento ? (
        <g transform="translate(960 650) rotate(-3)">
          <rect x={-150} y={-60} width={300} height={120} fill={"#F2ECDA"} />
          <text x={0} y={-12} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={documento.length > 16 ? 22 : 30} fill={W.tinta}>
            {documento}
          </text>
          {[14, 30, 46].map((ly) => (
            <rect key={ly} x={-120} y={ly} width={ly === 46 ? 160 : 240} height={4} fill={"#9A9078"} />
          ))}
        </g>
      ) : null}
      {/* globo terraqueo */}
      <g transform="translate(1600 860)">
        <rect x={-6} y={-180} width={12} height={180} fill={W.madera} />
        <circle cx={0} cy={-230} r={60} fill={"#C9B88A"} />
        <path d={`M ${-40 + Math.sin(f * 0.02) * 20} -260 q 20 -10 40 4 q 10 30 -16 40 Z`} fill={"#7E8A5E"} />
        <path d="M -60 -230 A 60 60 0 0 0 60 -230" fill="none" stroke={W.laton} strokeWidth={4} />
      </g>
    </g>
  );
};

export const despacho: Decorado = {
  desc: "Despacho de banquero o industrial: paneles de madera, ventana a las chimeneas, caja fuerte, retrato, reloj, escritorio con telefono de candelero y teletipo con su cinta; un hombre detras de la mesa con los rasgos del personaje.",
  admite:
    "variante (personaje sugerido): 'havenstein' (anciano calvo de barba blanca), 'stinnes' (barba negra), 'schacht' (gafas, bigote fino), 'erzberger' (gafas, bigote), 'luther', 'rathenau', 'stresemann', 'dawes', 'keynes', 'economista'; textos.documento (papel que lee, en grande), textos.placa (placa de laton en la mesa); hora",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.06], "el despacho entero"),
    cara: toma([960, 470, 2.4], [960, 450, 2.8], "primer plano del personaje"),
    medio: toma([960, 600, 1.7], [960, 590, 1.9], "el personaje tras el escritorio"),
    mesa: toma([800, 640, 2], [1100, 640, 2], "el telefono, los papeles y el teletipo"),
    ventana: toma([1510, 320, 2], [1480, 330, 2.2], "la ventana a las chimeneas"),
  },
  dibujo: Despacho,
};

/* ------------------------------------------------------------------ */
/* Cerveceria de Munich (sin simbolos)                                 */
/* ------------------------------------------------------------------ */

const Jarra: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-16} y={-46} width={32} height={46} rx={4} fill={"#9AA0A0"} />
    <rect x={-16} y={-46} width={32} height={10} fill={"#F2EFE6"} />
    <path d="M 16 -36 Q 30 -30 16 -12" stroke={"#9AA0A0"} strokeWidth={6} fill="none" />
    <rect x={-16} y={-46} width={6} height={46} fill={"#FFFFFF"} opacity={0.25} />
  </g>
);

const Cerveceria: React.FC<PropsDecorado> = ({ e, f }) => {
  const s = e.semilla ?? 27;
  const v = e.variante ?? "agitada";
  const rotulo = e.textos?.rotulo ?? "Bierkeller";
  const gente = e.gente ?? 0.8;
  const agitada = v !== "tranquila";
  return (
    <g>
      <Defs />
      <rect x={-200} y={-100} width={2320} height={1300} fill={"#D9CBA8"} />
      {/* bovedas pintadas */}
      {Array.from({ length: 4 }).map((_, i) => (
        <g key={i}>
          <path d={`M ${-100 + i * 560} 520 Q ${180 + i * 560} 0 ${460 + i * 560} 520`} fill="none" stroke={"#B9A57E"} strokeWidth={40} />
          <path d={`M ${-60 + i * 560} 520 Q ${180 + i * 560} 60 ${420 + i * 560} 520`} fill="none" stroke={"#5A6E5A"} strokeWidth={6} />
          {Array.from({ length: 5 }).map((_, k) => (
            <circle key={k} cx={40 + i * 560 + k * 70} cy={260 - Math.abs(k - 2) * 40} r={8} fill={"#8A3A30"} opacity={0.6} />
          ))}
          <rect x={440 + i * 560} y={300} width={60} height={560} fill={"#C9B88A"} />
        </g>
      ))}
      <rect x={-200} y={-100} width={2320} height={170} fill={"#B9A57E"} />
      <text x={960} y={135} textAnchor="middle" fontFamily={FUENTE.fraktur} fontSize={64} fill={"#5A3A2A"}>
        {rotulo}
      </text>
      {/* barriles */}
      {[0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${1600 + k * 110} ${520 - (k % 2) * 100})`}>
          <ellipse cx={0} cy={0} rx={50} ry={60} fill={W.maderaLuz} />
          <ellipse cx={0} cy={0} rx={30} ry={40} fill={W.maderaMedia} />
          <rect x={-4} y={-60} width={8} height={120} fill={W.hierro} opacity={0.5} />
        </g>
      ))}
      <Lampara x={500} y={160} largo={160} tipo="tulipa" />
      <Lampara x={1400} y={160} largo={160} tipo="tulipa" />
      <rect x={-200} y={600} width={2320} height={10} fill={"#8A7A5A"} />
      <rect x={-200} y={610} width={2320} height={260} fill={W.maderaMedia} />
      <SueloInterior y={870} tipo="tablas" />
      {/* humo de tabaco */}
      <Humo x={400} y={500} s={1.2} color={"#E8E0CC"} opacidad={0.3} semilla={s} viento={0.4} />
      <Humo x={1300} y={480} s={1.2} color={"#E8E0CC"} opacidad={0.3} semilla={s + 2} viento={-0.3} />
      {/* fila del fondo: gente sentada a la mesa larga */}
      {Array.from({ length: Math.round(4 + gente * 4) }).map((_, i) => (
        <Figura key={i} x={160 + i * 200} y={860} escala={0.7} semilla={s * 2 + i} ropa={i % 4 === 3 ? "mujer" : i % 2 ? "obrero" : "traje"} cuerpo="busto"
          pose={agitada ? (i % 3 === 0 ? "puno" : i % 3 === 1 ? "habla" : "brazos") : i % 2 ? "habla" : "mesa"} mirada={(i % 2 ? 1 : -1) * 0.5} gesto={agitada ? (i % 2 ? "inquieto" : "sorpresa") : "neutro"} />
      ))}
      <rect x={60} y={700} width={1800} height={22} fill={W.maderaClara} />
      <rect x={60} y={722} width={1800} height={140} fill={W.maderaLuz} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Jarra key={i} x={140 + i * 180 + (i % 2) * 30} y={704} s={0.9} />
      ))}
      {/* el que se sube a la silla y habla (un tipo cualquiera) */}
      <g>
        <rect x={880} y={900} width={160} height={20} fill={W.madera} />
        <rect x={890} y={920} width={14} height={140} fill={W.madera} />
        <rect x={1016} y={920} width={14} height={140} fill={W.madera} />
        <Figura x={960} y={904} escala={0.9} semilla={s + 99} ropa="abrigo" tocado="flexible" rasgos={{ bigote: "morsa", barba: "completa", edad: "maduro" }} pose="habla" habla mirada={0.2} gesto="serio" />
      </g>
      {/* camarera con jarras y gente de pie */}
      <Andante x0={-100} y={1060} v={1.4} escala={0.95} semilla={s + 50} ropa="mujer" tocado="ninguno" lleva="nada" />
      <g transform={`translate(${-100 + 1.4 * f + 70} 830)`}>
        <Jarra x={0} y={0} />
        <Jarra x={30} y={-10} />
      </g>
      <Figura x={300} y={1070} escala={0.98} semilla={s + 51} ropa="obrero" pose={agitada ? "puno" : "quieto"} mirada={0.6} gesto="inquieto" />
      <Figura x={1560} y={1070} escala={0.98} semilla={s + 52} ropa="traje" pose={agitada ? "habla" : "brazos"} mirada={-0.6} gesto="serio" />
      {v === "policia" ? (
        <g>
          {[1700, 1820].map((px, i) => (
            <Figura key={px} x={px} y={1060} escala={0.95} semilla={s + 60 + i} ropa="policia" pose="quieto" mirada={-0.7} gesto="serio" />
          ))}
        </g>
      ) : null}
    </g>
  );
};

export const cerveceria: Decorado = {
  desc: "Cerveceria de Munich, 1923: bovedas pintadas, barriles, humo de tabaco, mesa larga con jarras, gente agitada discutiendo y uno subido a una silla que arenga; camarera con jarras. Sin simbolos ni retratos de nadie.",
  admite: "variante 'agitada' (por defecto), 'tranquila', 'policia' (dos policias con chaco a la derecha); textos.rotulo (por defecto 'Bierkeller'); gente",
  tomas: {
    general: toma([960, 540, 1], [960, 560, 1.06], "la cerveceria entera"),
    arenga: toma([960, 520, 2], [960, 500, 2.3], "el hombre subido a la silla"),
    mesa: toma([520, 640, 1.9], [700, 640, 2], "la gente discutiendo en la mesa"),
    jarras: toma([1200, 690, 2.8], [1260, 690, 3], "las jarras sobre la mesa"),
    policia: toma([1640, 740, 1.9], [1680, 720, 2.1], "la derecha de la sala (policias con variante 'policia')"),
  },
  dibujo: Cerveceria,
};
