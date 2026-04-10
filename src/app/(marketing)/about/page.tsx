import Link from "next/link";
import {
  Flag,
  Brain,
  Unlock,
  Shield,
  MapPin,
  Users,
  Target,
  DollarSign,
  ArrowRight,
  Calendar,
  Building,
  Map,
} from "lucide-react";

const values = [
  {
    icon: Flag,
    title: "Democracy First",
    description:
      "We serve campaigns across the political spectrum. Our technology is nonpartisan.",
  },
  {
    icon: Brain,
    title: "AI for Good",
    description:
      "AI should augment human campaigning, not replace authentic connection with voters.",
  },
  {
    icon: Unlock,
    title: "Radical Accessibility",
    description:
      "Enterprise-grade tools shouldn't require enterprise-grade budgets.",
  },
  {
    icon: Shield,
    title: "Data Privacy",
    description:
      "Voter data is sacred. We never sell, share, or misuse the data on our platform.",
  },
];

const team = [
  {
    name: "Marcus Chen",
    title: "CEO & Co-Founder",
    initials: "MC",
    color: "bg-primary text-accent",
    bio: "Former campaign manager turned technologist. Managed 12 campaigns across 6 states before founding Campaign Institute.",
  },
  {
    name: "Dr. Priya Sharma",
    title: "CTO & Co-Founder",
    initials: "PS",
    color: "bg-accent text-primary",
    bio: "AI researcher from Stanford. Previously led ML teams at a major tech company. Passionate about applying AI to civic engagement.",
  },
  {
    name: "David Washington",
    title: "VP of Campaigns",
    initials: "DW",
    color: "bg-navy-light text-white",
    bio: "20-year veteran of political campaigns. Former state party chair. Ensures Campaign OS solves real problems for real campaigns.",
  },
  {
    name: "Elena Rodriguez",
    title: "VP of Product",
    initials: "ER",
    color: "bg-primary text-accent",
    bio: "Product leader who previously built tools at a leading civic tech organization. Obsessed with making complex technology simple.",
  },
];

const impactStats = [
  { value: "500+", label: "Campaigns Powered", icon: Target },
  { value: "48", label: "States", icon: Map },
  { value: "12M+", label: "Voter Contacts Made", icon: Users },
  { value: "$50M+", label: "Raised Through Platform", icon: DollarSign },
];

const companyStats = [
  { label: "Founded", value: "2023", icon: Calendar },
  { label: "HQ", value: "Washington, D.C.", icon: Building },
  { label: "Campaigns Served", value: "500+", icon: Target },
  { label: "States Active", value: "48", icon: MapPin },
];

export default function AboutPage() {
  return (
    <>
      {/* ==================== ABOUT HERO ==================== */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-4">
              About Campaign Institute
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Democratizing Campaign{" "}
              <span className="text-accent">Technology</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              We believe every candidate — from school board to Senate — deserves
              access to world-class campaign tools. Campaign Institute is on a
              mission to level the playing field.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== MISSION & STORY ==================== */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Our Story */}
            <div>
              <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
                Our Mission
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Campaign Institute was founded by veteran campaign operatives
                  and technologists who saw firsthand how resource gaps determined
                  outcomes.
                </p>
                <p>
                  Too many good candidates lose not because of their ideas, but
                  because they can&apos;t afford the same tools and staff as their
                  opponents.
                </p>
                <p>
                  We built Campaign OS to change that.
                </p>
              </div>
            </div>

            {/* Right: Key Stats */}
            <div className="space-y-4">
              {companyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="feature-card bg-white rounded-2xl p-6 flex items-center gap-5"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.label}
                    </p>
                    <p className="text-xl font-extrabold text-primary">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VALUES ==================== */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Our Values
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              What We Stand For
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="feature-card bg-white rounded-2xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/5 text-primary mb-5">
                  <value.icon size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== LEADERSHIP TEAM ==================== */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Our Team
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Leadership
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="feature-card bg-white rounded-2xl p-8 text-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${member.color} text-2xl font-extrabold mb-5`}
                >
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                <p className="text-accent text-sm font-semibold mb-4">
                  {member.title}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== IMPACT STATS ==================== */}
      <section className="hero-gradient py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Our Impact
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Powering Campaigns Across America
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent mb-4">
                  <stat.icon size={28} />
                </div>
                <p className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-white/60 text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CAREERS ==================== */}
      <section id="careers" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Careers
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Join Our Team
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              We&apos;re building the future of campaign technology and we need
              talented people to help us do it. We&apos;re a remote-first team of
              builders, campaigners, and technologists.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-10">
              If you&apos;re passionate about democracy, technology, and making
              an impact — we want to hear from you.
            </p>
            <Link
              href="/demo"
              className="btn-gold px-8 py-4 rounded-xl text-base inline-block"
            >
              See Open Positions
              <ArrowRight size={18} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== BOTTOM CTA ==================== */}
      <section className="hero-gradient py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to Level the{" "}
            <span className="text-accent">Playing Field?</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            See how Campaign OS can give your campaign the tools and technology
            it needs to win — regardless of budget.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="btn-gold px-10 py-4 rounded-xl text-lg w-full sm:w-auto"
            >
              Request a Demo
              <ArrowRight size={20} className="inline ml-2" />
            </Link>
            <Link
              href="/pricing"
              className="btn-outline-light px-10 py-4 rounded-xl text-lg w-full sm:w-auto text-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
