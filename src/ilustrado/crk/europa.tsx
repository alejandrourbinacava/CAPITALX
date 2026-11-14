import React from "react";
import { useCurrentFrame } from "remotion";
import type { Decorado, PropsDecorado } from "../tipos";
import { C, CieloNubes, Columna, Defs, Farola, T, Ventana, oscurecer, rr } from "./comun";
import { Andante, Figura, type Atuendo, type Gorro } from "./gente";

/**
 * Europa, 1931: una calle centroeuropea (Viena o Berlin) con la cola ante el
 * banco, el tranvia y la columna de anuncios; o Londres, con el muro ciego
 * del Banco de Inglaterra, el autobus rojo y el vendedor de periodicos.
 */

const SUELO = 860;

const Casa: React.FC<{ x: number; w: number; top: number; tono: string; tienda?: string; sem: number }> = ({ x, w, top, tono, tienda, sem }) => {
  const cols = Math.max(2, Math.floor(w / 120));
  return (
    <g>
      <rect x={x} y={top} width={w} height={SUELO - top} fill={tono} />
      {/* mansarda con buhardillas */}
      <path d={`M ${x - 10} ${top} L ${x + 30} ${top - 90} L ${x + w - 30} ${top - 90} L ${x + w + 10} ${top} Z`} fill={"#6E6A66"} />
      {Array.from({ length: cols }).map((_, c) => (
        <g key={c}>
          <rect x={x + 40 + c * ((w - 80) / cols)} y={top - 74} width={40} height={50} fill={"#8C8680"} />
          <rect x={x + 48 + c * ((w - 80) / cols)} y={top - 66} width={24} height={38} fill={C.cristal} />
        </g>
      ))}
      <rect x={x - 12} y={top - 8} width={w + 24} height={22} fill={oscurecer(tono, 0.85)} />
      {[0, 1, 2, 3].map((p) =>
        Array.from({ length: cols }).map((_, c) => {
          const vx = x + 34 + c * ((w - 68) / cols);
          const vy = top + 50 + p * 120;
          const vw = (w - 68) / cols - 40;
          return (
            <g key={`${p}-${c}`}>
              <Ventana x={vx} y={vy} w={vw} h={80} marco={oscurecer(tono, 0.9)} />
              {p === 1 ? <polygon points={`${vx - 14},${vy - 16} ${vx + vw / 2},${vy - 40} ${vx + vw + 14},${vy - 16}`} fill={oscurecer(tono, 0.88)} /> : null}
              {p === 1 && c % 2 === 0 ? (
                <g>
                  <rect x={vx - 16} y={vy + 86} width={vw + 32} height={10} fill={oscurecer(tono, 0.8)} />
                  {Array.from({ length: 6 }).map((__, b) => (
                    <rect key={b} x={vx - 10 + b * ((vw + 20) / 5)} y={vy + 60} width={3} height={28} fill={"#2A2A28"} />
                  ))}
                  <rect x={vx - 14} y={vy + 58} width={vw + 28} height={4} fill={"#2A2A28"} />
                </g>
              ) : null}
            </g>
          );
        })
      )}
      {/* planta baja almohadillada */}
      <rect x={x} y={SUELO - 190} width={w} height={190} fill={oscurecer(tono, 0.86)} />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={x} y={SUELO - 190 + i * 32} width={w} height={2} fill={oscurecer(tono, 0.72)} />
      ))}
      <rect x={x + 30} y={SUELO - 150} width={w - 160} height={150} fill={C.cristal} />
      <rect x={x + w - 110} y={SUELO - 160} width={70} height={160} fill={"#2A2018"} />
      {tienda ? (
        <g>
          <rect x={x + 20} y={SUELO - 186} width={w - 40} height={32} fill={["#2A3442", "#3A2A22", "#2F4A3F"][sem % 3]} />
          <T x={x + w / 2} y={SUELO - 162} tam={20} fam="serif" color={C.laton} esp={4}>
            {tienda}
          </T>
        </g>
      ) : null}
    </g>
  );
};

/** Columna de anuncios con carteles. */
const ColumnaAnuncios: React.FC<{ x: number; sem: number }> = ({ x, sem }) => (
  <g transform={`translate(${x} ${SUELO + 20})`}>
    <rect x={-60} y={-340} width={120} height={320} fill={"#5E6A5A"} />
    <rect x={-70} y={-30} width={140} height={30} fill={"#4A5446"} />
    <path d="M -66 -340 Q 0 -400 66 -340 Z" fill={"#4A5446"} />
    <rect x={-6} y={-410} width={12} height={30} fill={"#4A5446"} />
    {[0, 1, 2].map((k) => (
      <g key={k}>
        <rect x={-54} y={-320 + k * 96} width={108} height={86} fill={["#E9DFC6", "#D9B98A", "#C9D0C4"][(k + sem) % 3]} />
        <rect x={-46} y={-310 + k * 96} width={70} height={10} fill={["#C8402C", "#2A3442", "#3A2A22"][(k + sem) % 3]} />
        <rect x={-46} y={-292 + k * 96} width={90} height={5} fill={"#8E8270"} />
        <rect x={-46} y={-282 + k * 96} width={60} height={5} fill={"#8E8270"} />
        <circle cx={30} cy={-260 + k * 96} r={12} fill={["#C8402C", "#E8B33C", "#2E5A4E"][(k + sem) % 3]} opacity={0.7} />
      </g>
    ))}
  </g>
);

const Tranvia: React.FC<{ x0: number; v: number; color: string }> = ({ x0, v, color }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  return (
    <g transform={`translate(${x} ${SUELO + 170})`}>
      <ellipse cx={260} cy={0} rx={300} ry={12} fill="#000" opacity={0.2} />
      <rect x={0} y={-250} width={520} height={210} rx={14} fill={color} />
      <rect x={0} y={-130} width={520} height={90} fill={"#E9DFC6"} />
      <rect x={-6} y={-262} width={532} height={18} rx={8} fill={oscurecer(color, 0.8)} />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <rect x={30 + i * 80} y={-230} width={62} height={80} fill={C.cristal} />
          <circle cx={60 + i * 80} cy={-196} r={12} fill={"#E2B892"} opacity={rr(i, 4) > 0.4 ? 1 : 0} />
          <rect x={48 + i * 80} y={-214} width={24} height={8} fill={"#2A2420"} opacity={rr(i, 4) > 0.4 ? 1 : 0} />
        </g>
      ))}
      <path d="M 260 -262 L 230 -340 L 300 -420" stroke={"#2A2A28"} strokeWidth={5} fill="none" />
      {[90, 430].map((cx) => (
        <g key={cx}>
          <rect x={cx - 60} y={-44} width={120} height={20} fill={"#2A2A28"} />
          <circle cx={cx - 30} cy={-18} r={18} fill={"#1E1E1C"} />
          <circle cx={cx + 30} cy={-18} r={18} fill={"#1E1E1C"} />
        </g>
      ))}
    </g>
  );
};

const AutobusLondres: React.FC<{ x0: number; v: number }> = ({ x0, v }) => {
  const f = useCurrentFrame();
  const x = x0 + v * f;
  const giro = (f * v * 2.4) % 360;
  return (
    <g transform={`translate(${x} ${SUELO + 170}) scale(-1 1)`}>
      <ellipse cx={240} cy={0} rx={280} ry={12} fill="#000" opacity={0.2} />
      <rect x={0} y={-400} width={480} height={360} rx={12} fill={"#B23526"} />
      <rect x={0} y={-230} width={480} height={20} fill={"#EFE3C4"} />
      {[0, 1].map((p) =>
        Array.from({ length: 6 }).map((_, i) => (
          <rect key={`${p}${i}`} x={24 + i * 76} y={-380 + p * 170} width={60} height={80} rx={4} fill={C.cristal} />
        ))
      )}
      <rect x={480} y={-150} width={60} height={110} rx={6} fill={"#3A3E40"} />
      {[90, 420].map((cx) => (
        <g key={cx} transform={`translate(${cx} -36)`}>
          <circle r={40} fill={"#15181A"} />
          <circle r={26} fill={"#7A2A22"} />
          <rect x={-2} y={-26} width={4} height={52} fill={"#15181A"} transform={`rotate(${giro})`} />
        </g>
      ))}
    </g>
  );
};

/** Muro ciego del Banco de Inglaterra (Soane) con columnas adosadas. */
const BancoInglaterra: React.FC = () => (
  <g>
    <rect x={300} y={300} width={1500} height={SUELO - 300} fill="url(#crk-sillar)" />
    <rect x={280} y={270} width={1540} height={50} fill={C.piedra} />
    <rect x={280} y={250} width={1540} height={22} fill={C.piedraOscura} />
    {Array.from({ length: 9 }).map((_, i) => (
      <g key={i}>
        <Columna x={360 + i * 170} y={SUELO - 40} h={480} w={44} />
        {i < 8 ? <rect x={410 + i * 170} y={480} width={70} height={200} rx={35} fill={C.piedraSombra} /> : null}
      </g>
    ))}
    <rect x={280} y={SUELO - 40} width={1540} height={40} fill={C.piedraMedia} />
    <rect x={300} y={200} width={1500} height={50} fill={C.piedraMedia} />
  </g>
);

const DibujoEuropa: React.FC<PropsDecorado> = ({ e, f }) => {
  const sem = e.semilla ?? 12;
  const v = e.variante ?? "viena";
  const londres = v === "londres";
  const berlin = v === "berlin";
  const gente = e.gente ?? 0.9;
  const nombre = (e.textos?.nombre ?? (berlin ? "DANATBANK" : "CREDITANSTALT")).toUpperCase();
  const aviso = e.textos?.aviso;
  const cartel = e.textos?.cartel;
  const BX = 640;
  const BW = 820;
  const gorroCiudad: Gorro[] = londres ? ["bombin", "bombin", "fedora", "bombin"] : ["fedora", "fedora", "bombin", "fedora"];
  return (
    <g>
      <Defs />
      <CieloNubes ancho={2100} alto={SUELO} hora={e.hora} gris sem={sem} />
      {londres ? (
        <g>
          <Casa x={-200} w={520} top={180} tono={"#B9AE96"} sem={sem} />
          <Casa x={1780} w={500} top={160} tono={"#A89C86"} sem={sem + 1} />
          <BancoInglaterra />
        </g>
      ) : (
        <g>
          <Casa x={-200} w={860} top={200} tono={berlin ? "#B9AE9A" : "#E2CFA4"} tienda={berlin ? "TABAK · ZIGARREN" : "KAFFEEHAUS"} sem={sem} />
          <Casa x={1440} w={760} top={180} tono={berlin ? "#A8A090" : "#D9C49A"} tienda={berlin ? "APOTHEKE" : "TRAFIK"} sem={sem + 1} />
          {/* el banco */}
          <rect x={BX} y={160} width={BW} height={SUELO - 160} fill={berlin ? "#C9C0AC" : "#E9DFC6"} />
          <rect x={BX - 20} y={140} width={BW + 40} height={40} fill={C.piedraMedia} />
          <rect x={BX} y={190} width={BW} height={70} fill={C.piedra} />
          <T x={BX + BW / 2} y={242} tam={nombre.length > 14 ? 40 : 50} fam="serif" color={C.tinta} esp={8}>
            {nombre}
          </T>
          {[0, 1, 2, 3, 4].map((c) => (
            <Ventana key={c} x={BX + 50 + c * 150} y={290} w={90} h={130} marco={C.piedraMedia} />
          ))}
          {[0, 1, 2, 3, 4].map((c) => (
            <Ventana key={c} x={BX + 50 + c * 150} y={470} w={90} h={110} marco={C.piedraMedia} />
          ))}
          <rect x={BX} y={SUELO - 240} width={BW} height={240} fill={C.piedraSombra} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={BX} y={SUELO - 240 + i * 30} width={BW} height={2} fill={C.piedraOscura} />
          ))}
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <path d={`M ${BX + 110 + k * 230} ${SUELO} L ${BX + 110 + k * 230} ${SUELO - 150} Q ${BX + 170 + k * 230} ${SUELO - 220} ${BX + 230 + k * 230} ${SUELO - 150} L ${BX + 230 + k * 230} ${SUELO} Z`} fill={"#2A2018"} />
            </g>
          ))}
          {aviso ? (
            <g transform={`translate(${BX + BW / 2} ${SUELO - 110}) rotate(-2)`}>
              <rect x={-110} y={-50} width={220} height={100} fill={"#F2ECDD"} />
              <T x={0} y={0} tam={aviso.length > 12 ? 22 : 30} color={C.carmin}>
                {aviso}
              </T>
              <rect x={-80} y={18} width={160} height={6} fill={"#B6AD96"} />
            </g>
          ) : null}
          {/* hilo del tranvia */}
          <path d={`M -200 ${SUELO - 300} L 2300 ${SUELO - 300}`} stroke={"#2A2A28"} strokeWidth={3} />
        </g>
      )}
      <rect x={-200} y={SUELO} width={2500} height={36} fill={C.acera} />
      <rect x={-200} y={SUELO + 36} width={2500} height={300} fill="url(#crk-adoquin)" />
      {!londres ? (
        <g>
          <rect x={-200} y={SUELO + 150} width={2500} height={6} fill={"#5E5A50"} />
          <rect x={-200} y={SUELO + 170} width={2500} height={6} fill={"#5E5A50"} />
        </g>
      ) : null}
      <Farola x={560} y={SUELO + 20} />
      {londres ? null : <ColumnaAnuncios x={1560} sem={sem} />}
      {/* la cola ante la puerta del banco (o la gente ante el muro) */}
      {Array.from({ length: Math.round(14 * gente) + 3 }).map((_, i) => {
        const k = sem * 50 + i;
        const at: Atuendo[] = ["traje", "mujer", "traje", "obrero", "mujer", "traje", "traje"];
        const a = at[i % at.length];
        return (
          <Andante
            key={i}
            x0={londres ? -200 + ((i * 251 + sem * 37) % 2400) : BX + 150 - i * 58}
            y={SUELO + 30 + (i % 3) * 6}
            v={londres ? (i % 2 ? -1.2 : 1.2) : 0}
            dir={1}
            escala={0.62}
            semilla={k}
            atuendo={a}
            gorro={a === "traje" ? gorroCiudad[i % 4] : undefined}
            lleva={londres && i % 3 === 0 ? "periodico" : "nada"}
            cabizbajo={!londres && rr(k, 3) > 0.5}
          />
        );
      })}
      {!londres
        ? Array.from({ length: Math.round(8 * gente) + 2 }).map((_, i) => {
            const k = sem * 80 + i;
            const at: Atuendo[] = ["mujer", "traje", "traje", "obrero", "mujer"];
            const a = at[i % at.length];
            return (
              <Andante key={i} x0={BX + BW - 160 + i * 58} y={SUELO + 34 + (i % 2) * 6} v={0} dir={-1} escala={0.62} semilla={k} atuendo={a} gorro={a === "traje" ? gorroCiudad[(i + 1) % 4] : undefined} lleva="nada" cabizbajo={rr(k, 4) > 0.5} />
            );
          })
        : null}
      {/* vehiculos */}
      {londres ? <AutobusLondres x0={2400} v={-2.2} /> : <Tranvia x0={-700} v={1.6} color={berlin ? "#D9B23C" : "#B23526"} />}
      {/* policia y vendedor de periodicos en primer termino */}
      {londres ? (
        <g>
          <Figura x={1500} y={1060} escala={0.8} semilla={sem * 9} atuendo="repartidor" pose="habla" rasgos={{ edad: "joven" }} />
          <g transform="translate(1590 1040)">
            <rect x={0} y={-190} width={150} height={190} fill={"#2A1E16"} />
            <rect x={8} y={-182} width={134} height={174} fill={"#F2EDE0"} />
            {(cartel ?? "GOLD STANDARD|SUSPENDED").split("|").map((l, i) => (
              <T key={i} x={75} y={-140 + i * 34} tam={Math.min(24, Math.floor(210 / Math.max(1, l.length)))} color={i === 0 ? C.tinta : C.carmin}>
                {l}
              </T>
            ))}
            <rect x={24} y={-60} width={100} height={5} fill={"#B6AD96"} />
            <rect x={24} y={-46} width={80} height={5} fill={"#B6AD96"} />
          </g>
          <Figura x={300} y={1090} escala={0.82} semilla={sem * 9 + 1} atuendo="traje" gorro="bombin" pose="lee" gesto="serio" />
        </g>
      ) : (
        <g>
          <Figura x={BX + BW - 40} y={SUELO + 60} escala={0.64} semilla={sem * 9 + 2} atuendo="policia" traje={"#3A4A3E"} pose="quieto" gesto="serio" />
          {Array.from({ length: 5 }).map((_, i) => {
            const k = sem * 120 + i;
            return <Figura key={i} x={160 + i * 420 + rr(k, 1) * 60} y={1170} escala={0.8} semilla={k} atuendo={i % 2 ? "mujer" : "traje"} gorro={i % 2 ? undefined : "fedora"} cuerpo="busto" gesto={rr(k, 2) > 0.5 ? "inquieto" : "serio"} mirada={160 + i * 420 < BX + BW / 2 ? 0.7 : -0.7} />;
          })}
        </g>
      )}
    </g>
  );
};

export const EUROPA: Decorado = {
  desc: "Europa en 1931. 'viena' (por defecto) y 'berlin': calle con casas de mansarda y balcones, el banco con su nombre en grande, la cola ante la puerta, el tranvia, la columna de anuncios y un policia. 'londres': el muro ciego del Banco de Inglaterra, el autobus rojo, un vendedor con el cartel del dia y un caballero con bombin.",
  ancho: 2100,
  admite: "variante viena|berlin|londres; textos.nombre (rotulo del banco: por defecto CREDITANSTALT o DANATBANK), textos.aviso (cartel en la puerta del banco, p. ej. GESCHLOSSEN), textos.cartel (cartel del vendedor en Londres, lineas separadas por '|'); gente; semilla",
  tomas: {
    general: { de: { x: 1000, y: 540, z: 1 }, a: { x: 1100, y: 560, z: 1.05 }, desc: "la calle y el banco" },
    banco: { de: { x: 1050, y: 300, z: 1.75 }, a: { x: 1050, y: 300, z: 1.95 }, desc: "la fachada con el nombre del banco" },
    cola: { de: { x: 640, y: 720, z: 1.8 }, a: { x: 720, y: 720, z: 1.95 }, desc: "la cola ante la puerta" },
    caras: { de: { x: 900, y: 860, z: 2.0 }, a: { x: 960, y: 860, z: 2.2 }, desc: "caras de la gente en primer termino" },
    anuncios: { de: { x: 1600, y: 680, z: 1.9 }, a: { x: 1620, y: 680, z: 2.1 }, desc: "la columna de anuncios y la calle (en Londres: el vendedor de periodicos)" },
  },
  dibujo: DibujoEuropa,
};
