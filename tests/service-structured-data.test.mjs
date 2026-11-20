import assert from "node:assert/strict";
import test from "node:test";
import { ORGANIZATION_ID, serviceIndexJsonLd, servicePageJsonLd } from "../src/lib/structured-data.ts";
import { siteSettings } from "../src/site.ts";

test("service page graph links a visible service to the canonical organization", () => {
  const graph = servicePageJsonLd({
    name: "Sertifikasi Sistem Manajemen Mutu",
    description: "Layanan sertifikasi sistem manajemen mutu.",
    path: "/services/iso-9001/",
    image: "/images/iso-9001.jpg",
    serviceType: "Certification",
    category: "Quality management",
  });
  const service = graph.find((item) => item["@type"] === "Service");
  assert.ok(service);
  assert.equal(service.url, new URL("/services/iso-9001/", siteSettings.url).toString());
  assert.deepEqual(service.provider, { "@id": ORGANIZATION_ID });
  assert.equal(service.image, new URL("/images/iso-9001.jpg", siteSettings.url).toString());
  assert.equal(graph.length, 3);
});

test("service page graph omits unsupported optional claims", () => {
  const graph = servicePageJsonLd({
    name: "Example service",
    description: "Example description.",
    path: "/services/example/",
  });
  const service = graph.find((item) => item["@type"] === "Service");
  assert.ok(service);
  assert.equal("areaServed" in service, false);
  assert.equal("serviceType" in service, false);
  assert.equal("category" in service, false);
  assert.equal("image" in service, false);
});

test("service index lists only the supplied visible services", () => {
  const graph = serviceIndexJsonLd([
    { name: "Service A", description: "Description A", path: "/services/a/" },
  ]);
  const list = graph.find((item) => item["@type"] === "ItemList");
  assert.ok(list);
  assert.equal(list.itemListElement.length, 1);
  assert.equal(list.itemListElement[0].item.url, new URL("/services/a/", siteSettings.url).toString());
});
