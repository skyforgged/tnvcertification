import assert from "node:assert/strict";
import test from "node:test";
import { trainingPageJsonLd } from "../src/lib/structured-data.ts";
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
