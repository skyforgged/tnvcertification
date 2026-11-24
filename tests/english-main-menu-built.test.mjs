import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const expected = {
  Home: "/en/",
  Services: "/en/services/",
  CSMS: "/en/csms/",
  Trainings: "/en/trainings/",
  Schedules: "/en/schedules/",
  Articles: "/en/articles/",
  About: "/en/about-us/",
};

const footerLabels = {
  Home: "Home",
  Services: "Services",
  CSMS: "CSMS",
  Schedules: "Training schedules",
  Articles: "Articles and guides",
  About: "About",
};

function walk(directory) {
  if (!readdirSync) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name === "index.html") files.push(full);
  }
  return files;
}

function section(html, tag) {
  return html.match(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`))?.[0] ?? "";
}

function anchors(html) {
  return [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((match) => ({
    href: match[1],
    text: match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .trim(),
  }));
}

test("real English pages keep every main-menu link inside /en/", () => {
  const files = walk("dist").filter((file) => file.split(path.sep).includes("en"));
  assert.ok(files.length > 0, "no built English pages found; run pnpm build first");

  const realPages = files.filter((file) => {
    const html = readFileSync(file, "utf8");
    return !/http-equiv=["']refresh["']/i.test(html);
  });
  assert.ok(realPages.length > 0, "no real English pages found");

  for (const [label, href] of Object.entries(expected)) {
    assert.ok(
      realPages.some((file) => file.includes(href === "/en/" ? "en/index.html" : `${href.slice(1)}index.html`)),
      `missing real page for ${label}: ${href}`,
    );
  }

  for (const file of realPages) {
    const html = readFileSync(file, "utf8");
    assert.match(html, /<html lang="en">/, file);

    const header = section(html, "header");
    const mainNav = header.match(/<nav aria-label="Main navigation">[\s\S]*?<\/nav>/)?.[0] ?? "";
    const headerLinks = anchors(mainNav);
    const footerLinks = anchors(section(html, "footer"));

    for (const menuLink of headerLinks) {
      assert.ok(menuLink.href.startsWith("/en/"), `${file}: ${menuLink.text} -> ${menuLink.href}`);
    }

    for (const [label, href] of Object.entries(expected)) {
      const headerLink = headerLinks.find((link) => link.text === label);
      assert.ok(headerLink, `${file}: missing header link ${label}`);
      assert.equal(headerLink.href, href, `${file}: header ${label}`);

      const footerLabel = footerLabels[label] ?? label;
      const footerLink = footerLinks.find((link) => link.text === footerLabel);
      assert.ok(footerLink, `${file}: missing footer link ${footerLabel}`);
      assert.equal(footerLink.href, href, `${file}: footer ${footerLabel}`);
    }
  }
});

test("English home and service surfaces use English article records", () => {
  const homeRoute = readFileSync("src/pages/en/index.astro", "utf8");
  const serviceRoute = readFileSync("src/pages/en/services/[slug].astro", "utf8");
  assert.match(homeRoute, /getPublishedArticles\("en"\)/);
  assert.match(serviceRoute, /getPublishedArticles\("en"\)/);

  const html = readFileSync("dist/en/index.html", "utf8");
  const cards = [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)]
    .map((match) => match[0])
    .filter((card) => /href="\/en\/articles\//.test(card));
  assert.equal(cards.length, 3, "English home must show three translated article cards");

  for (const card of cards) {
    const href = card.match(/href="(\/en\/articles\/[^"]+)"/)?.[1];
    assert.ok(href, `missing English article link in card: ${card}`);
    const title = card.match(/<h3[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim();
    assert.ok(title, `missing article title in card: ${card}`);
    const detail = readFileSync(`dist${href}index.html`, "utf8");
    const heading = detail.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .trim();
    assert.equal(title, heading, `${href}: card title must match its English detail page`);
  }
});
