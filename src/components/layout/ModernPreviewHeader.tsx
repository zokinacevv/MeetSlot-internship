import Link from "next/link";
import { ArrowUpRight, CalendarClock } from "lucide-react";

export function ModernPreviewHeader() {
  return (
    <header className="modern-nav">
      <Link href="/" className="modern-brand"><span className="modern-brand-icon"><CalendarClock size={19} /></span><span>meet<span>slot</span></span></Link>
      <nav aria-label="Main navigation">
        <Link href="/#how-it-works">How it works</Link>
        <Link className="modern-nav-cta" href="/dashboard">Host dashboard <ArrowUpRight size={15} /></Link>
      </nav>
    </header>
  );
}
