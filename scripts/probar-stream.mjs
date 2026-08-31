/**
 * Prueba el lector de trozos con un stream fabricado.
 *
 * Sin esto, la unica forma de saber si funciona es lanzarlo contra la API de
 * verdad, y eso son minutos y dinero por cada intento.
 */
import fs from "node:fs/promises";

const src = await fs.readFile(new URL("./guion.mjs", import.meta.url), "utf8");
const leerStream = new Function("return " + src.match(/async function leerStream[\s\S]*?\n}/)[0])();

const evento = (o) => `event: ${o.type}\ndata: ${JSON.stringify(o)}\n\n`;

const trozos = [
  evento({ type: "message_start", message: { usage: { input_tokens: 100, cache_read_input_tokens: 4000 } } }),
  evento({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }),
  evento({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: '```json\n{"a":1' } }),
  evento({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: '}\n```' } }),
  evento({ type: "message_delta", usage: { output_tokens: 250 } }),
  evento({ type: "message_stop" }),
];

const enc = new TextEncoder();

// Se parte a lo bruto en trozos de 40 bytes, para comprobar que aguanta que un
// evento llegue cortado por la mitad, que es lo que pasa de verdad en la red.
const todo = enc.encode(trozos.join(""));
const res = {
  body: new ReadableStream({
    start(c) {
      for (let i = 0; i < todo.length; i += 40) c.enqueue(todo.slice(i, i + 40));
      c.close();
    },
  }),
};

const j = await leerStream(res);
const texto = (j.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");

console.log("texto recibido:", JSON.stringify(texto));
console.log("usage:", JSON.stringify(j.usage));

const bien = texto === '```json\n{"a":1}\n```' && j.usage.output_tokens === 250;
console.log(bien ? "\nOK" : "\nMAL: el lector no reconstruye la respuesta");
process.exit(bien ? 0 : 1);
