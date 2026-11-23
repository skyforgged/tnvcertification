interface ScheduleDateRange {
  startDate?: string;
  endDate?: string;
}

interface ScheduleSortItem {
  data: ScheduleDateRange & { slug: string };
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
  return `${formatDate(startDate, locale)} – ${formatDate(endDate, locale)}`;
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
