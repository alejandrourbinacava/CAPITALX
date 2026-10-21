/**
 * Lo que se le manda a YouTube: titulo, descripcion y etiquetas.
 *
 * Los capitulos se calculan de la duracion REAL de la locucion (los tiempos de
 * cada plano), nunca de lo que el guionista creyera. Si no, YouTube los ignora
 * o, peor, salen desplazados.
 *
 * Reglas de YouTube que se vigilan aqui, porque una subida rechazada a las dos
 * de la manana cuesta una noche entera:
 *   titulo       <= 100 caracteres
 *   descripcion  <= 5000 bytes
 *   etiquetas    <= 500 caracteres entre todas (cuentan las comas y las comillas)
 *   capitulos    el primero en 0:00, al menos tres, cada uno de >= 10 s
 */

export function hms(segundos) {
  const t = Math.floor(segundos);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** [{ t: segundos, nombre }] uno por bloque. */
export function capitulos(doc, tiempos) {
  const nombres = doc.publicacion?.capitulos ?? [];
  const lista = [];
  let t = 0;
  doc.bloques.forEach((b, i) => {
    lista.push({ t, nombre: String(nombres[i] || b.nombre || `Parte ${i + 1}`).trim() });
    for (const p of b.planos) t += (tiempos[p.id]?.duration ?? 0) + 0.34;
  });
  if (lista.length) lista[0].t = 0;
  return lista;
}

/** Los capitulos solo valen si cumplen las reglas de YouTube. */
export function capitulosValidos(lista) {
  if (lista.length < 3) return false;
  for (let i = 1; i < lista.length; i++) if (lista[i].t - lista[i - 1].t < 10) return false;
  return true;
}

export function textoCapitulos(lista) {
  return lista.map((c) => `${hms(c.t)} ${c.nombre}`).join("\n");
}

export function descripcionFinal(doc, tiempos) {
  const base = String(doc.publicacion?.descripcion ?? "").trim();
  const lista = capitulos(doc, tiempos);
  const bloque = capitulosValidos(lista) ? textoCapitulos(lista) : "";

  let d = base;
  if (d.includes("[CAPITULOS]")) {
    d = d.replace("[CAPITULOS]", bloque);
  } else if (bloque && !/^\s*0:00\b/m.test(d)) {
    d = `${d}\n\nCAPÍTULOS\n${bloque}`;
  }
  // YouTube no admite < ni > en la descripcion
  d = d.replace(/[<>]/g, "");
  // 5000 BYTES, no caracteres: los acentos pesan dos
  while (Buffer.byteLength(d, "utf8") > 4900) d = d.slice(0, d.lastIndexOf("\n"));
  return d;
}

/** Etiquetas que caben en 500 caracteres. YouTube cuenta como una coma extra por etiqueta. */
export function etiquetasFinal(doc) {
  const out = [];
  let n = 0;
  for (const raw of doc.publicacion?.etiquetas ?? []) {
    const e = String(raw).replace(/[<>"]/g, "").trim();
    if (!e) continue;
    const coste = e.length + (e.includes(" ") ? 2 : 0) + 1;
    if (n + coste > 480) break;
    out.push(e);
    n += coste;
  }
  return out;
}

export function tituloFinal(doc) {
  const t = String(doc.publicacion?.titulo || doc.titulo || "").replace(/[<>]/g, "").trim();
  if (t.length <= 100) return t;
  // cortar en una palabra entera, no a mitad
  const corte = t.slice(0, 99);
  return corte.slice(0, corte.lastIndexOf(" ")).replace(/[\s,:;(–—-]+$/, "") + "…";
}
