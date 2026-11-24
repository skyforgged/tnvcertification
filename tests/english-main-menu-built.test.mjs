import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const expected = {
  Home: "/en/",
  Services: "/en/services/",
  CSMS: "/en/csms/",
  Trainings: "/en/trainings/",
  About: "/en/about-us/",
};

const footerLabels = {
  Home: "Home",
  Services: "Services",
  CSMS: "CSMS",
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
