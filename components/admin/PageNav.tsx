import Link from "next/link";

function pageHref(
  basePath: string,
  dateParamName: string,
  selectedDate: string,
  todayStr: string,
  pageParamName: string,
  page: number
): string {
  const params = new URLSearchParams();
  if (selectedDate !== todayStr) params.set(dateParamName, selectedDate);
  if (page > 1) params.set(pageParamName, String(page));
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

export default function PageNav({
  basePath,
  dateParamName,
  selectedDate,
  todayStr,
  pageParamName,
  page,
  totalPages,
}: {
  basePath: string;
  dateParamName: string;
  selectedDate: string;
  todayStr: string;
  pageParamName: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-2">
      {page > 1 ? (
        <Link
          href={pageHref(basePath, dateParamName, selectedDate, todayStr, pageParamName, page - 1)}
          className="text-muted text-[11px] font-body underline underline-offset-2 hover:text-gold"
        >
          ← Prev
        </Link>
      ) : (
        <span className="text-muted/40 text-[11px] font-body">← Prev</span>
      )}
      <span className="text-muted text-[11px] font-body">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={pageHref(basePath, dateParamName, selectedDate, todayStr, pageParamName, page + 1)}
          className="text-muted text-[11px] font-body underline underline-offset-2 hover:text-gold"
        >
          Next →
        </Link>
      ) : (
        <span className="text-muted/40 text-[11px] font-body">Next →</span>
      )}
    </div>
  );
}
