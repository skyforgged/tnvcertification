import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const component = await readFile(
  new URL("../src/components/BlockRenderer.astro", import.meta.url),
  "utf8",
);

const contentSection = component.slice(
  component.indexOf('block.type === "content-section"'),
  component.indexOf('block.type === "faq"'),
);

const layouts = ["editorial", "bento", "highlight", "feature-list", "comparison", "numbered-grid"]
  .map((name) => ({ name, at: contentSection.indexOf(`{block.items && layout === "${name}"`) }))
  .filter((entry) => entry.at >= 0)
  .sort((a, b) => a.at - b.at);

const layoutSource = (index) =>
  contentSection.slice(
    layouts[index].at,
    index + 1 < layouts.length ? layouts[index + 1].at : contentSection.length,
  );

test("every content-section layout exposes a semantic class on item headings", () => {
  assert.equal(layouts.length, 6);
  layouts.forEach((layout, index) => {
    assert.match(
      layoutSource(index),
      /<h3[^>]*block-section-item-heading/,
      layout.name,
    );
  });
});

test("every content-section layout exposes a semantic class and surface token on item descriptions", () => {
  layouts.forEach((layout, index) => {
    const source = layoutSource(index);
    assert.match(source, /<p[^>]*block-section-item-description/, layout.name);
    assert.match(
      source,
      /<p[^>]*block-section-item-description[^>]*style\.body|<p[^>]*style\.body[^>]*block-section-item-description/,
      layout.name,
    );
  });
});
