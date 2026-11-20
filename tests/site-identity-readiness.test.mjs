import test from "node:test";
import assert from "node:assert/strict";
import { siteIdentityReadiness } from "../src/lib/site-identity-readiness.ts";

const complete = {
  url: "https://intiprima.example.id",
  email: "info@intiprima.example.id",
  phone: "+62-21-1234-5678",
  street: "WTC 3, 20th Floor, R30, Jl. Jendral Sudirman",
  sameAs: ["https://linkedin.com/company/intiprima"],
};

test("flags current pre-launch placeholder identity values", () => {
  const current = {
    url: "https://www.intiprima-sertifikasi.dev",
    email: "sertifikasi@intiprima.example",
    phone: "+62-21-5555-0000",
    street: "Jalan Pahlawan No. 123",
    sameAs: ["https://www.linkedin.com/company/pt-intiprima-sertifikasi"],
  };
  const result = siteIdentityReadiness(current);
  assert.equal(result.ready, false);
  assert.deepEqual(result.findings.map((item) => item.field), ["url", "email", "phone", "street"]);
});

test("reports complete-looking values as ready without asserting verification", () => {
  const result = siteIdentityReadiness(complete);
  assert.equal(result.ready, true);
  assert.deepEqual(result.findings, []);
});

test("reports missing required identity fields", () => {
  const result = siteIdentityReadiness({ url: "", email: "", phone: "", street: "" });
  assert.equal(result.ready, false);
  assert.equal(result.findings.length, 4);
});

test("rejects placeholder or non-https social profile URLs", () => {
  const result = siteIdentityReadiness({ ...complete, sameAs: ["http://example.com", "not-a-url"] });
  assert.equal(result.ready, false);
  assert.equal(result.findings.length, 2);
});
