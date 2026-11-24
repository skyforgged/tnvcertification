import assert from "node:assert/strict";
import test from "node:test";
import { articlePageJsonLd, pageJsonLdGraph } from "../src/lib/structured-data.ts";
import { siteSettings } from "../src/site.ts";

const path = "/articles/contoh-artikel/";
const url = new URL(path, siteSettings.url).toString();

const input = {
  name: "Contoh artikel",
  description: "Deskripsi artikel.",
  path,
  image: "/images/contoh.jpg",
  lang: "id",
  datePublished: "2026-11-01",
  dateModified: "2026-11-02",
  blocks: [
    { type: "content-section", id: "teknik-pelaksanaan-audit", title: "Teknik mengumpulkan dan mengevaluasi bukti audit", description: "Paragraf pembuka." },
    { type: "faq", id: "faq-artikel", items: [{ question: "Apa?", answer: "Jawaban." }] },
    { type: "howto", id: "langkah-audit", steps: [{ title: "Satu", description: "Langkah pertama." }] },
  ],
};

test("article block nodes share the training anchor convention and stay in the graph", () => {
  const entities = articlePageJsonLd(input);
  const ids = entities.filter((e) => ["WebPageElement", "FAQPage", "HowTo"].includes(e["@type"])).map((e) => e["@id"]);
  assert.deepEqual(ids, [
    `${url}#teknik-pelaksanaan-audit`,
    `${url}#faq-artikel`,
    `${url}#langkah-audit`,
  ]);

  const graph = pageJsonLdGraph(entities);
  const page = graph["@graph"].find((e) => e["@type"] === "WebPage");
  assert.deepEqual(page.hasPart, ids.map((id) => ({ "@id": id })));
});
