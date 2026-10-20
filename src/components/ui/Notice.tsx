export function Notice({ tone = "error", children }: { tone?: "error" | "success"; children: React.ReactNode }) {
  const styles = tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800";
  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-3 py-2 text-sm ${styles}`}>{children}</p>;
}
