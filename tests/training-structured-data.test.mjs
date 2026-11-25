import assert from "node:assert/strict";
import test from "node:test";
import { pageJsonLdGraph, trainingPageJsonLd } from "../src/lib/structured-data.ts";
import { siteSettings } from "../src/site.ts";

const path = "/trainings/pelatihan-auditor-internal-fssc-22000/";
const url = new URL(path, siteSettings.url).toString();

test("CourseInstance uses only Schema.org properties and is linked from Course", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan Auditor Internal FSSC 22000",
    description: "Pelatihan auditor internal FSSC 22000.",
    path,
    blocks: [],
    schedules: [
      { slug: "batch-1", startDate: "2027-01-13", endDate: "2027-01-14", locationType: "offline" },
    ],
  });

  const instances = entities.filter((entity) => entity["@type"] === "CourseInstance");
  assert.equal(instances.length, 1);
  assert.equal("course" in instances[0], false, "course is not a CourseInstance property in schema.org");

  const course = entities.find((entity) => entity["@type"] === "Course");
  assert.equal(course["@id"], `${url}#course`);
  assert.deepEqual(course.hasCourseInstance, [{ "@id": instances[0]["@id"] }]);
});

test("content-section blocks contribute a WebPageElement anchored to the rendered section id", () => {
  const blocks = [{
    type: "content-section",
    id: "teknik-pelaksanaan-audit",
    title: "Teknik mengumpulkan dan mengevaluasi bukti audit",
    description: "Kesimpulan audit harus didasarkan pada informasi yang relevan dan dapat diverifikasi.",
    items: [{ title: "Wawancara personel", description: "Auditor mengajukan pertanyaan terbuka." }],
  }];
  const entities = trainingPageJsonLd({
    name: "Pelatihan Auditor Internal FSSC 22000",
    description: "Pelatihan auditor internal FSSC 22000.",
    path,
    blocks,
  });

  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(section["@id"], `${url}#teknik-pelaksanaan-audit`);
  assert.equal(section.name, "Teknik mengumpulkan dan mengevaluasi bukti audit");
  assert.equal(section.description, blocks[0].description);
  assert.equal(section.hasPart.length, 1);
  assert.equal(section.hasPart[0]["@type"], "CreativeWork");
  assert.equal(section.hasPart[0].name, "Wawancara personel");
  assert.equal(section.hasPart[0].description, blocks[0].items[0].description);
  assert.equal("image" in section, false);

  const page = entities.find((entity) => entity["@type"] === "WebPage");
  assert.deepEqual(page.hasPart, [{ "@id": section["@id"] }]);
});

test("FAQ and HowTo @id fragments match their rendered section anchors", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [
      { type: "faq", id: "faq-utama", items: [{ question: "Apa?", answer: "Jawaban." }] },
      { type: "howto", id: "tahapan-audit", steps: [{ title: "Satu", description: "Langkah pertama." }] },
    ],
  });
  assert.equal(entities.find((e) => e["@type"] === "FAQPage")["@id"], `${url}#faq-utama`);
  assert.equal(entities.find((e) => e["@type"] === "HowTo")["@id"], `${url}#tahapan-audit`);
});

test("blocks without an explicit id use a deterministic anchor derived from their title", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{ type: "content-section", title: "Pemeriksaan Dokumen", description: "Teks." }],
  });
  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(section["@id"], `${url}#pemeriksaan-dokumen`);
});

test("section nodes omit absent optional fields and survive graph assembly", () => {
  const graph = pageJsonLdGraph(trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{ type: "content-section", id: "ringkas", title: "Ringkasan" }],
  }));
  const section = graph["@graph"].find((entity) => entity["@type"] === "WebPageElement");
  assert.equal("description" in section, false);
  assert.equal("hasPart" in section, false);
  assert.ok(graph["@graph"].some((entity) =>
    entity["@type"] === "WebPage" &&
    entity.hasPart?.some((part) => part["@id"] === section["@id"])));
});

test("content-section with schema ItemList emits a nested ItemList with numbered ListItems", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{
      type: "content-section",
      id: "tujuan-dan-kompetensi-peserta",
      schema: "ItemList",
      title: "Tujuan dan kompetensi yang dikembangkan",
      description: "Paragraf pembuka.",
      items: [
        { title: "Memahami kriteria audit", description: "Mengenali kriteria." },
        { title: "Merencanakan kegiatan audit", description: "Menentukan tujuan." },
      ],
    }],
  });

  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(section["@id"], `${url}#tujuan-dan-kompetensi-peserta`);
  assert.equal("hasPart" in section, false, "hasPart only accepts CreativeWork values");
  assert.equal(section.mainEntity["@type"], "ItemList");
  assert.deepEqual(section.mainEntity.itemListElement, [
    { "@type": "ListItem", position: 1, name: "Memahami kriteria audit", description: "Mengenali kriteria." },
    { "@type": "ListItem", position: 2, name: "Merencanakan kegiatan audit", description: "Menentukan tujuan." },
  ]);
});

test("schema ItemList without items omits hasPart", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{ type: "content-section", id: "kosong", schema: "ItemList", title: "Kosong" }],
  });
  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal("hasPart" in section, false);
});

test("content-section without schema keeps the CreativeWork array", () => {
  const entities = trainingPageJsonLd({
    name: "Pelatihan",
    description: "Deskripsi pelatihan.",
    path,
    blocks: [{
      type: "content-section",
      id: "standar",
      title: "Standar",
      items: [{ title: "Satu", description: "Teks." }],
    }],
  });
  const section = entities.find((entity) => entity["@type"] === "WebPageElement");
  assert.equal(Array.isArray(section.hasPart), true);
  assert.equal(section.hasPart[0]["@type"], "CreativeWork");
});
