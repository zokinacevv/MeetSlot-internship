import Link from "next/link";
import { ArrowUpRight, CalendarClock } from "lucide-react";
export function Header() {
  return <header className="site-header"><div className="site-header-inner"><Link href="/" className="brand"><span className="brand-mark"><CalendarClock size={18} strokeWidth={2.2} /></span><span>meet<span className="brand-light">slot</span></span></Link><nav className="site-nav" aria-label="Main navigation"><Link className="nav-book" href="/#booking">Book a time</Link><Link className="nav-host" href="/dashboard">For hosts <ArrowUpRight size={14} /></Link></nav></div></header>;
}
