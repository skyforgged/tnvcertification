export interface PageLink {
  label: string;
  href: string;
  current: boolean;
}

export interface AdjacentPageHrefs {
  previous: string | null;
  next: string | null;
}

function pageHref(page: number, root: string): string {
  const base = root.replace(/\/$/, "");
  return page === 1 ? `${base}/` : `${base}/page/${page}/`;
}

export function getPageLinks(current: number, total: number, root: string): PageLink[] {
  return Array.from({ length: total }, (_, index) => {
    const page = index + 1;
    return { label: String(page), href: pageHref(page, root), current: page === current };
  });
}

export function getAdjacentPageHrefs(current: number, total: number, root: string): AdjacentPageHrefs {
  return {
    previous: current > 1 ? pageHref(current - 1, root) : null,
    next: current < total ? pageHref(current + 1, root) : null,
  };
}
