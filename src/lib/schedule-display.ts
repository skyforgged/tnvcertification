interface ScheduleDateRange {
  startDate?: string;
  endDate?: string;
}

interface ScheduleSortItem {
  data: ScheduleDateRange & {
    slug: string;
    registrationStatus?: "open" | "closed" | "full" | "cancelled";
  };
}

const formatDate = (value: string, locale: string): string =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export function scheduleDateLabel(
  startDate: string | undefined,
  endDate: string | undefined,
  options: { locale?: string; pendingLabel?: string } = {},
): string {
  if (!startDate || !endDate) return options.pendingLabel ?? "Jadwal akan diumumkan";
  const locale = options.locale ?? "id-ID";
  if (startDate === endDate) return formatDate(startDate, locale);
  return `${formatDate(startDate, locale)} – ${formatDate(endDate, locale)}`;
}

/** Pick the nearest upcoming sessions, then display them farthest-first. */
export function selectUpcomingSchedules<T extends ScheduleSortItem>(
  items: T[],
  today: string,
  limit: number,
): T[] {
  const eligible = items.filter((item) => {
    const startDate = item.data.startDate;
    return Boolean(startDate)
      && startDate! >= today
      && item.data.registrationStatus !== "cancelled";
  });

  const bySlug = (a: T, b: T): number => a.data.slug.localeCompare(b.data.slug);
  const nearest = [...eligible]
    .sort((a, b) => a.data.startDate!.localeCompare(b.data.startDate!) || bySlug(a, b))
    .slice(0, limit);

  return nearest.sort(
    (a, b) => b.data.startDate!.localeCompare(a.data.startDate!) || bySlug(a, b),
  );
}

export function sortSchedulesByStartDate<T extends ScheduleSortItem>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aDate = a.data.startDate ?? "";
    const bDate = b.data.startDate ?? "";
    if (!aDate && bDate) return 1;
    if (aDate && !bDate) return -1;
    return aDate.localeCompare(bDate) || a.data.slug.localeCompare(b.data.slug);
  });
}
