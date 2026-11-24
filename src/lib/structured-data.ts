/**
 * Canonical JSON-LD entities. Organization is defined once from site.ts and
 * referenced by @id from other entity graphs (for example service pages).
 */
import { organization, siteSettings } from "../site.ts";
import { siteCrumb } from "../data/breadcrumbs.ts";
import type { PageBlock } from "../data/pages";

export const ORGANIZATION_ID = `${siteSettings.url}/#organization`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: organization.name,
    alternateName: organization.shortName,
    url: organization.url,
    description: organization.description,
    logo: {
      "@type": "ImageObject",
      url: new URL(organization.logo.url, siteSettings.url).toString(),
      width: organization.logo.width,
      height: organization.logo.height,
    },
    email: organization.contact.email,
    telephone: organization.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: organization.contact.address.street,
      addressLocality: organization.contact.address.city,
      addressRegion: organization.contact.address.province,
      postalCode: organization.contact.address.postalCode,
      addressCountry: organization.contact.address.countryCode,
    },
    sameAs: [...organization.sameAs],
  };
}

/** Escape `<` so a JSON-LD script block cannot be closed by injected data. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export interface ServiceStructuredDataInput {
  name: string;
  description: string;
  path: string;
  image?: string;
  serviceType?: string;
  category?: string;
  lang?: string;
}

/**
 * JSON-LD graph for a visible, published service page.
 * Only supplied, content-backed optional fields are emitted.
 */
export function servicePageJsonLd(input: ServiceStructuredDataInput) {
  const url = new URL(input.path, siteSettings.url).toString();
  const serviceId = `${url}#service`;
  const breadcrumbId = `${url}#breadcrumb`;
  const pageId = `${url}#webpage`;
  const homeCrumb = siteCrumb("/", input.lang);
  const servicesCrumb = siteCrumb("/services/", input.lang);

  const service: Record<string, unknown> = {
    "@type": "Service",
    "@id": serviceId,
    name: input.name,
    description: input.description,
    url,
    provider: { "@id": ORGANIZATION_ID },
  };
  if (input.image) service.image = new URL(input.image, siteSettings.url).toString();
  if (input.serviceType) service.serviceType = input.serviceType;
  if (input.category) service.category = input.category;

  return [
    {
      "@type": "WebPage",
      "@id": pageId,
      url,
      name: input.name,
      description: input.description,
      mainEntity: { "@id": serviceId },
      breadcrumb: { "@id": breadcrumbId },
    },
    service,
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: homeCrumb.label, item: homeCrumb.href === "/" ? siteSettings.url : new URL(homeCrumb.href, siteSettings.url).toString() },
        { "@type": "ListItem", position: 2, name: servicesCrumb.label, item: new URL(servicesCrumb.href, siteSettings.url).toString() },
        { "@type": "ListItem", position: 3, name: input.name, item: url },
      ],
    },
  ];
}

/** CollectionPage graph for the service directory, using only visible entries. */
export function serviceIndexJsonLd(
  services: Array<{ name: string; path: string; description: string }>,
) {
  const url = new URL("/services/", siteSettings.url).toString();
  return [
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      url,
      name: "Layanan",
      description: "Daftar layanan yang tersedia.",
      mainEntity: { "@id": `${url}#itemlist` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.name,
          description: service.description,
          url: new URL(service.path, siteSettings.url).toString(),
          provider: { "@id": ORGANIZATION_ID },
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: siteSettings.url },
        { "@type": "ListItem", position: 2, name: "Layanan", item: url },
      ],
    },
  ];
}

/** One valid JSON-LD document containing the canonical organization and page graph. */
export function pageJsonLdGraph(additionalEntities: unknown[] = []) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), ...additionalEntities],
  };
}


export interface TrainingStructuredDataInput {
  name: string;
  description: string;
  path: string;
  image?: string;
  lang?: string;
  blocks: PageBlock[];
  relatedServices?: Array<{ name: string; description: string; path: string }>;
  schedules?: Array<{
    slug: string;
    startDate?: string;
    endDate?: string;
    locationType?: "offline" | "online" | "hybrid";
    venue?: string;
    city?: string;
    province?: string;
    price?: number;
    currency?: string;
  }>;
}

/** Connected JSON-LD graph generated from published training content and schedules. */
export function trainingPageJsonLd(input: TrainingStructuredDataInput) {
  const url = new URL(input.path, siteSettings.url).toString();
  const courseId = `${url}#course`;
  const breadcrumbId = `${url}#breadcrumb`;
  const entities: Array<Record<string, unknown>> = [];
  const pageParts: Array<{ "@id": string }> = [];

  const relatedServices = (input.relatedServices ?? []).map((service) => {
    const serviceUrl = new URL(service.path, siteSettings.url).toString();
    const id = `${serviceUrl}#service`;
    entities.push({
      "@type": "Service",
      "@id": id,
      name: service.name,
      description: service.description,
      url: serviceUrl,
      provider: { "@id": ORGANIZATION_ID },
    });
    return { "@id": id };
  });

  const instances = (input.schedules ?? [])
    .filter((schedule) => Boolean(schedule.startDate && schedule.endDate))
    .map((schedule) => {
      const id = `${url}#course-instance-${schedule.slug}`;
      const instance: Record<string, unknown> = {
        "@type": "CourseInstance",
        "@id": id,
        name: input.name,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        url,
      };
      if (schedule.locationType) {
        instance.courseMode = schedule.locationType === "offline" ? "inPerson" : schedule.locationType === "online" ? "online" : "blended";
      }
      if (schedule.venue || schedule.city || schedule.province) {
        instance.location = {
          "@type": "Place",
          ...(schedule.venue ? { name: schedule.venue } : {}),
          ...(schedule.city || schedule.province ? {
            address: {
              "@type": "PostalAddress",
              ...(schedule.city ? { addressLocality: schedule.city } : {}),
              ...(schedule.province ? { addressRegion: schedule.province } : {}),
              addressCountry: "ID",
            },
          } : {}),
        };
      }
      if (schedule.price !== undefined && schedule.currency) {
        instance.offers = { "@type": "Offer", price: schedule.price, priceCurrency: schedule.currency, url };
      }
      entities.push(instance);
      return { "@id": id };
    });

  entities.push({
    "@type": "Course",
    "@id": courseId,
    name: input.name,
    description: input.description,
    url,
    provider: { "@id": ORGANIZATION_ID },
    inLanguage: input.lang ?? "id",
    ...(input.image ? { image: new URL(input.image, siteSettings.url).toString() } : {}),
    ...(relatedServices.length ? { about: relatedServices } : {}),
    ...(instances.length ? { hasCourseInstance: instances } : {}),
  });

  input.blocks.forEach((block, index) => {
    if (block.type === "faq" && Array.isArray(block.items) && block.items.length) {
      const id = `${url}#faq-${block.id ?? index + 1}`;
      entities.push({
        "@type": "FAQPage",
        "@id": id,
        mainEntity: block.items.map((item: { question: string; answer: string }) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      });
      pageParts.push({ "@id": id });
    }
    if (block.type === "howto" && Array.isArray(block.steps) && block.steps.length) {
      const id = `${url}#howto-${block.id ?? index + 1}`;
      entities.push({
        "@type": "HowTo",
        "@id": id,
        name: block.title ?? input.name,
        step: block.steps.map((step: { title: string; description: string; image?: { src: string } }, stepIndex: number) => ({
          "@type": "HowToStep",
          position: stepIndex + 1,
          name: step.title,
          text: step.description,
          ...(step.image?.src ? { image: new URL(step.image.src, siteSettings.url).toString() } : {}),
        })),
      });
      pageParts.push({ "@id": id });
    }
  });

  entities.push(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: input.name,
      description: input.description,
      inLanguage: input.lang ?? "id",
      mainEntity: { "@id": courseId },
      breadcrumb: { "@id": breadcrumbId },
      ...(pageParts.length ? { hasPart: pageParts } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: input.lang === "en" ? "Home" : "Beranda", item: siteSettings.url },
        { "@type": "ListItem", position: 2, name: input.lang === "en" ? "Training" : "Pelatihan", item: new URL("/trainings/", siteSettings.url).toString() },
        { "@type": "ListItem", position: 3, name: input.name, item: url },
      ],
    },
  );
  return entities;
}


export interface ArticleStructuredDataInput {
  name: string;
  description: string;
  path: string;
  image: string;
  lang: string;
  datePublished: string;
  dateModified: string;
  blocks: PageBlock[];
  relatedServices?: Array<{ name: string; description: string; path: string }>;
  relatedCourses?: Array<{ name: string; description: string; path: string }>;
}

/** Article graph with explicit links to the service/course entities it discusses. */
export function articlePageJsonLd(input: ArticleStructuredDataInput) {
  const url = new URL(input.path, siteSettings.url).toString();
  const articleId = `${url}#article`;
  const pageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const about: Array<{ "@id": string }> = [];
  const entities: Array<Record<string, unknown>> = [];
  const pageParts: Array<{ "@id": string }> = [];

  for (const service of input.relatedServices ?? []) {
    const serviceUrl = new URL(service.path, siteSettings.url).toString();
    const id = `${serviceUrl}#service`;
    entities.push({
      "@type": "Service",
      "@id": id,
      name: service.name,
      description: service.description,
      url: serviceUrl,
      provider: { "@id": ORGANIZATION_ID },
    });
    about.push({ "@id": id });
  }
  for (const course of input.relatedCourses ?? []) {
    const courseUrl = new URL(course.path, siteSettings.url).toString();
    const id = `${courseUrl}#course`;
    entities.push({
      "@type": "Course",
      "@id": id,
      name: course.name,
      description: course.description,
      url: courseUrl,
      provider: { "@id": ORGANIZATION_ID },
    });
    about.push({ "@id": id });
  }

  entities.push({
    "@type": "Article",
    "@id": articleId,
    headline: input.name,
    name: input.name,
    description: input.description,
    url,
    image: new URL(input.image, siteSettings.url).toString(),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.lang,
    publisher: { "@id": ORGANIZATION_ID },
    mainEntityOfPage: { "@id": pageId },
    ...(about.length ? { about } : {}),
  });

  input.blocks.forEach((block, index) => {
    if (block.type === "faq" && block.items.length) {
      const id = `${url}#faq-${block.id ?? index + 1}`;
      entities.push({
        "@type": "FAQPage",
        "@id": id,
        mainEntity: block.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      });
      pageParts.push({ "@id": id });
    }
    if (block.type === "howto" && block.steps.length) {
      const id = `${url}#howto-${block.id ?? index + 1}`;
      entities.push({
        "@type": "HowTo",
        "@id": id,
        name: block.title ?? input.name,
        step: block.steps.map((step, stepIndex) => ({
          "@type": "HowToStep",
          position: stepIndex + 1,
          name: step.title,
          text: step.description,
          ...(step.image?.src ? { image: new URL(step.image.src, siteSettings.url).toString() } : {}),
        })),
      });
      pageParts.push({ "@id": id });
    }
  });

  entities.push(
    {
      "@type": "WebPage",
      "@id": pageId,
      url,
      name: input.name,
      description: input.description,
      inLanguage: input.lang,
      mainEntity: { "@id": articleId },
      breadcrumb: { "@id": breadcrumbId },
      ...(pageParts.length ? { hasPart: pageParts } : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: input.lang === "en" ? "Home" : "Beranda", item: siteSettings.url },
        { "@type": "ListItem", position: 2, name: input.lang === "en" ? "Articles" : "Artikel", item: new URL("/articles/", siteSettings.url).toString() },
        { "@type": "ListItem", position: 3, name: input.name, item: url },
      ],
    },
  );
  return entities;
}
