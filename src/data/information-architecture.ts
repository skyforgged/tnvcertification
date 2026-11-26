/**
 * Canonical route ownership and redirect contract for the published site.
 * Navigation labels and links remain owned by src/site.ts.
 */
export const informationArchitecture = {
  coreRoutes: ["/", "/services/", "/csms/", "/trainings/", "/schedules/", "/articles/", "/about-us/"],
  routeFamilies: [
    { id: "service-detail", prefix: "/services/", source: "services" },
    { id: "article-detail", prefix: "/articles/", source: "articles", excludes: ["/articles/page/"] },
    { id: "article-pagination", prefix: "/articles/page/", source: "articles" },
    { id: "training-detail", prefix: "/trainings/", source: "training" },
    { id: "csms-topic", prefix: "/csms/", source: "pages" },
    { id: "english-service-index-and-detail", prefix: "/en/services/", source: "services" },
  ],
  redirects: { "/en/": "/", "/service/": "/services/", "/schedule/": "/schedules/", "/hal-about-us/": "/about-us/" },
} as const;
