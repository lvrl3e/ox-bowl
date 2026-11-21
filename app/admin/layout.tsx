import type { Metadata } from "next";

// Belt-and-suspenders with app/robots.ts (which disallows /admin for
// crawlers): this keeps every /admin/* page out of search indexes even
// if something links to it directly.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
