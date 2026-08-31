/**
 * Prueba el lector de trozos con un stream fabricado.
 *
 * Sin esto, la unica forma de saber si funciona es lanzarlo contra la API de
 * verdad, y eso son minutos y dinero por intento. Comprueba dos cosas: que
 * reconstruye la respuesta aunque llegue partida, y que se entera de si ya
 * habia empezado a recibir, que es lo que decide si se puede reintentar sin
 * pagar el guion dos veces.
 */
import fs from "node:fs/promises";

const src = await fs.readFile(new URL("./guion.mjs", import.meta.url), "utf8");
const leerStream = new Function("return " + src.match(/async function leerStream[\s\S]*?\n}/)[0])();

const evento = (o) => `event: ${o.type}\ndata: ${JSON.stringify(o)}\n\n`;
const enc = new TextEncoder();

const trozos = [
  evento({ type: "message_start", message: { usage: { input_tokens: 100, cache_read_input_tokens: 4000 } } }),
  evento({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }),
  evento({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: '```json\n{"a":1' } }),
  evento({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "}\n```" } }),
  evento({ type: "message_delta", usage: { output_tokens: 250 } }),
  evento({ type: "message_stop" }),
];

// 1. Llega entero, pero partido cada 40 bytes: un evento puede venir cortado
//    por la mitad, que es como llega de verdad por la red.
const todo = enc.encode(trozos.join(""));
const entero = {
  body: new ReadableStream({
    start(c) {
      for (let i = 0; i < todo.length; i += 40) c.enqueue(todo.slice(i, i + 40));
      c.close();
    },
  }),
};

const j = await leerStream(entero, { recibido: false });
const texto = (j.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
const reconstruye = texto === '```json\n{"a":1}\n```' && j.usage.output_tokens === 250;

console.log("llega entero:");
console.log("  texto: " + JSON.stringify(texto));
console.log("  usage: " + JSON.stringify(j.usage));
console.log(reconstruye ? "  bien" : "  MAL: no reconstruye la respuesta");

// 2. Se corta a mitad. Lo que importa no es el error, es que quede constancia
//    de que ya habia llegado algo: significa que el modelo estaba escribiendo,
//    y reintentar seria pagarlo otra vez.
// El corte va en un tick posterior a proposito. Si se encola y se rompe en el
// mismo, el lector no llega a leer nada y la prueba no reproduce lo que pasa
// de verdad, que es recibir un trozo y perder la conexion despues.
const cortado = {
  body: new ReadableStream({
    async start(c) {
      c.enqueue(enc.encode(trozos[0] + trozos[1]));
      await new Promise((r) => setTimeout(r, 10));
      c.error(new Error("socket cerrado"));
    },
  }),
};

const marca = { recibido: false };
let fallo = null;
try {
  await leerStream(cortado, marca);
} catch (e) {
  fallo = e.message;
}

console.log("");
console.log("se corta a mitad:");
console.log("  error: " + fallo);
console.log("  ya habia recibido: " + marca.recibido);
console.log(marca.recibido ? "  bien: no reintentara" : "  MAL: reintentaria y lo pagaria dos veces");

const ok = reconstruye && marca.recibido === true;
console.log("");
console.log(ok ? "OK" : "MAL");
process.exit(ok ? 0 : 1);
