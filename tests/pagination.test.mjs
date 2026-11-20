import assert from "node:assert/strict";
import test from "node:test";

import { getAdjacentPageHrefs, getPageLinks } from "../src/lib/pagination.ts";

const root = "/articles/";

test("getPageLinks builds crawlable page hrefs and marks current page", () => {
  assert.deepEqual(getPageLinks(1, 3, root), [
    { label: "1", href: "/articles/", current: true },
    { label: "2", href: "/articles/page/2/", current: false },
    { label: "3", href: "/articles/page/3/", current: false },
  ]);

  assert.deepEqual(getPageLinks(2, 3, root), [
    { label: "1", href: "/articles/", current: false },
    { label: "2", href: "/articles/page/2/", current: true },
    { label: "3", href: "/articles/page/3/", current: false },
  ]);
});

test("getAdjacentPageHrefs omits Previous on first page and Next on last page", () => {
  assert.deepEqual(getAdjacentPageHrefs(1, 3, root), {
    previous: null,
    next: "/articles/page/2/",
  });
  assert.deepEqual(getAdjacentPageHrefs(2, 3, root), {
    previous: "/articles/",
    next: "/articles/page/3/",
  });
  assert.deepEqual(getAdjacentPageHrefs(3, 3, root), {
    previous: "/articles/page/2/",
    next: null,
  });
});
