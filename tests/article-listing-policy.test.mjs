import assert from "node:assert/strict";
import test from "node:test";
import { getHomepageArticles, getPublishedArticles, getRelatedArticles, getServiceIndexArticles, sortArticles } from "../src/data/articles.ts";

const articles = getPublishedArticles();

test("canonical article order is deterministic across all tie-breakers", () => {
  const date = new Date("2026-11-20T00:00:00Z");
  const older = new Date("2026-11-10T00:00:00Z");
  const newer = new Date("2026-11-15T00:00:00Z");
  const input = [
    { id: "b", slug: "b", effectiveDate: date, pubDate: older },
    { id: "a", slug: "z", effectiveDate: date, pubDate: newer },
    { id: "a", slug: "a", effectiveDate: date, pubDate: newer },
    { id: "c", slug: "c", effectiveDate: new Date("2026-11-21T00:00:00Z"), pubDate: older },
  ];
  assert.deepEqual(sortArticles(input).map((item) => item.slug), ["c", "a", "z", "b"]);
  assert.deepEqual(input.map((item) => item.slug), ["b", "z", "a", "c"], "sortArticles must not mutate its input");
});

test("homepage and service index use disjoint global article ranks", () => {
  assert.deepEqual(getHomepageArticles(articles), articles.slice(0, 3));
  assert.deepEqual(getServiceIndexArticles(articles), articles.slice(3, 6));
  const homeIds = new Set(getHomepageArticles(articles).map((item) => item.id));
  assert.ok(getServiceIndexArticles(articles).every((item) => !homeIds.has(item.id)));
});

test("related article results use only an explicit serviceId and preserve canonical order", () => {
  const serviceId = 2;
  assert.deepEqual(getRelatedArticles(articles, serviceId), articles.filter((item) => item.serviceId === serviceId));
  assert.deepEqual(getRelatedArticles(articles, 999999), []);
});

test("published article collection is returned in canonical order", () => {
  assert.deepEqual(articles, sortArticles(articles));
});
