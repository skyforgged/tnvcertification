import assert from "node:assert/strict";
import test from "node:test";
import { validatePageImageRecords } from "../src/lib/page-image-validation.mjs";
test("accepts unique images per URL",()=>assert.deepEqual(validatePageImageRecords([{route:"/",src:"/a.webp",hash:"a"},{route:"/articles/",src:"/b.webp",hash:"b"}]),[]));
test("rejects duplicate image paths",()=>assert.ok(validatePageImageRecords([{route:"/",src:"/same.webp"},{route:"/articles/",src:"/same.webp"}]).some(x=>x.rule==="PAGE-IMAGE-003")));
test("rejects identical image bytes under different names",()=>assert.ok(validatePageImageRecords([{route:"/",src:"/a.webp",hash:"same"},{route:"/articles/",src:"/b.webp",hash:"same"}]).some(x=>x.rule==="PAGE-IMAGE-004")));
test("rejects duplicate canonical URLs",()=>assert.ok(validatePageImageRecords([{route:"/",src:"/a.webp"},{route:"/",src:"/b.webp"}]).some(x=>x.rule==="PAGE-IMAGE-001")));
