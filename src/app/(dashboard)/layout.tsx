/**
 * Outer dashboard segment. Keeps error.tsx as a parent boundary so Nest/network
 * failures thrown from the nested gated layout are caught (same-segment layout
 * errors are not caught by a sibling error.tsx).
 */
export default function DashboardSegmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
