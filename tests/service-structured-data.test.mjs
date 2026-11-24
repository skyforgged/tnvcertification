import assert from "node:assert/strict";
import test from "node:test";
import { ORGANIZATION_ID, organizationJsonLd, pageJsonLdGraph, serviceIndexJsonLd, servicePageJsonLd } from "../src/lib/structured-data.ts";
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

test("service page graph localizes breadcrumbs for English services", () => {
  const graph = servicePageJsonLd({
    name: "ISO 14001 certification",
    description: "Environmental management certification.",
    path: "/en/services/iso-14001-2026-certification/",
    lang: "en",
  });
  const breadcrumbs = graph.find((item) => item["@type"] === "BreadcrumbList");
  assert.ok(breadcrumbs);
  assert.deepEqual(
    breadcrumbs.itemListElement.map((item) => [item.name, item.item]),
    [
      ["Home", siteSettings.url],
      ["Services", new URL("/en/services/", siteSettings.url).toString()],
      ["ISO 14001 certification", new URL("/en/services/iso-14001-2026-certification/", siteSettings.url).toString()],
    ],
  );
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


test("page JSON-LD is serialized as a Schema.org graph with the organization", () => {
  const graph = pageJsonLdGraph(servicePageJsonLd({
    name: "Example service",
    description: "Example description.",
    path: "/services/example/",
  }));
  assert.equal(graph["@context"], "https://schema.org");
  assert.ok(Array.isArray(graph["@graph"]));
  assert.ok(graph["@graph"].some((item) => item["@type"] === "Organization"));
  assert.ok(graph["@graph"].some((item) => item["@type"] === "Service"));
});

test("canonical organization exposes its logo as an image for rich results", () => {
  const organization = organizationJsonLd();
  assert.equal(organization.image, new URL(organization.logo.url, siteSettings.url).toString());
});
