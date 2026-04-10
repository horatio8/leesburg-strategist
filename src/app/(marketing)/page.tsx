import Link from "next/link";
import {
  Users,
  MessageSquare,
  Phone,
  BarChart3,
  DollarSign,
  Brain,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "AI-Powered CRM",
    description:
      "Smart voter management that auto-enriches profiles, tracks every touchpoint, and predicts supporter likelihood scores in real time.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: MessageSquare,
    title: "Texting & P2P",
    description:
      "Reach thousands of voters instantly with AI-drafted messages. Peer-to-peer and broadcast SMS with built-in compliance and opt-out management.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Phone,
    title: "AI Phone Banking",
    description:
      "Virtual call center that never sleeps. AI agents handle voter outreach, surveys, and GOTV calls with natural conversation at massive scale.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: BarChart3,
    title: "Voter Analytics",
    description:
      "AI-driven micro-targeting and predictive modeling. Identify persuadable voters, optimize turf cuts, and track movement in real time.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: DollarSign,
    title: "Fundraising & Compliance",
    description:
      "Automated donor management with FEC-compliant reporting. AI optimizes ask amounts, timing, and channels to maximize contributions.",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Brain,
    title: "AI Strategy Engine",
    description:
      "Data-driven campaign strategy powered by AI. Generate messaging frameworks, opposition research, and tactical plans in minutes.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

const stats = [
  { value: "3x", label: "Staff Capacity", detail: "equivalent full-time staffers" },
  { value: "10x", label: "Voter Contacts", detail: "more touches per dollar" },
  { value: "47%", label: "Cost Savings", detail: "vs. traditional tools" },
  { value: "2min", label: "Setup Time", detail: "import data and go live" },
];

const testimonials = [
  {
    quote:
      "Campaign OS replaced five different tools and three staff positions. We ran a leaner operation and won by 8 points in a race everyone said we'd lose.",
    name: "Sarah Mitchell",
    title: "Campaign Manager",
    race: "U.S. House, OH-12",
    rating: 5,
  },
  {
    quote:
      "The AI phone banking alone was worth it. We made 50,000 voter contacts in a single weekend with a team of two. That's unheard of for a state legislature race.",
    name: "James Rodriguez",
    title: "Political Director",
    race: "State Senate, TX-21",
    rating: 5,
  },
  {
    quote:
      "We used to spend weeks building our voter contact plan. Campaign OS generated a better strategy in 20 minutes, with targeting we never would have found on our own.",
    name: "Angela Foster",
    title: "Field Director",
    race: "City Council, Atlanta",
    rating: 5,
  },
];

const steps = [
  {
    step: "01",
    title: "Import Your Voter File",
    description:
      "Upload your voter data or connect directly to your state's voter file. Campaign OS instantly enriches every record with predictive scores and contact information.",
  },
  {
    step: "02",
    title: "AI Builds Your Strategy",
    description:
      "Our AI analyzes your district, opponents, and voter universe to generate a winning campaign plan — complete with messaging, targeting, and timeline.",
  },
  {
    step: "03",
    title: "Execute Across All Channels",
    description:
      "Launch coordinated voter outreach across text, phone, email, and door-to-door from a single dashboard. AI optimizes in real time as results come in.",
  },
];

const logos = [
  "Democratic Campaigns",
  "Republican Campaigns",
  "Independent Candidates",
  "PACs & Issue Orgs",
  "Ballot Initiatives",
  "School Boards",
];

export default function HomePage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-32 lg:pb-40">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} className="text-accent" />
              <span className="text-white/80 text-sm font-medium">
                The #1 AI-Powered Campaign Platform
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Your Entire Campaign.
              <br />
              <span className="text-accent">One AI Platform.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              Campaign OS unifies CRM, texting, phone banking, voter analytics,
              and fundraising into one AI-first platform. Get the power of{" "}
              <strong className="text-white">3 full-time staffers</strong> — at
              a fraction of the cost.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/demo"
                className="btn-gold px-8 py-4 rounded-xl text-base sm:text-lg w-full sm:w-auto"
              >
                Request a Demo
                <ArrowRight size={18} className="inline ml-2" />
              </Link>
              <Link
                href="/product"
                className="btn-outline-light px-8 py-4 rounded-xl text-base sm:text-lg w-full sm:w-auto text-center"
              >
                See How It Works
              </Link>
            </div>

            {/* Social proof micro */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/50 text-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>FEC Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Setup in 2 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          {/* Hero visual - Platform mockup */}
          <div className="mt-16 lg:mt-20 max-w-5xl mx-auto">
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-2xl">
              <div className="bg-navy-dark rounded-xl overflow-hidden">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                    <div className="w-3 h-3 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-block bg-white/10 rounded-md px-4 py-1 text-xs text-white/40">
                      app.campaigninstitute.com/dashboard
                    </div>
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div className="p-6 lg:p-8 min-h-[300px] lg:min-h-[400px]">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Voter Contacts", val: "147,832", trend: "+12.3%" },
                      { label: "Doors Knocked", val: "23,491", trend: "+8.7%" },
                      { label: "Texts Sent", val: "89,204", trend: "+34.2%" },
                      { label: "Donations", val: "$284,750", trend: "+18.9%" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="stat-card rounded-lg p-4"
                      >
                        <p className="text-white/40 text-xs mb-1">{stat.label}</p>
                        <p className="text-white text-xl font-bold">{stat.val}</p>
                        <p className="text-green-400 text-xs mt-1">{stat.trend}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 stat-card rounded-lg p-4 h-48">
                      <p className="text-white/40 text-xs mb-3">Voter Contact Trend</p>
                      <div className="flex items-end gap-1 h-32">
                        {[30, 45, 35, 60, 52, 78, 65, 88, 72, 95, 85, 100].map(
                          (h, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-accent/60 rounded-sm"
                              style={{ height: `${h}%` }}
                            />
                          )
                        )}
                      </div>
                    </div>
                    <div className="stat-card rounded-lg p-4 h-48">
                      <p className="text-white/40 text-xs mb-3">AI Tasks Active</p>
                      <div className="space-y-3 mt-4">
                        {["Phone banking — 2,340 calls", "SMS blast — 12K queued", "Donor outreach — Active"].map((t) => (
                          <div key={t} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 research-pulse" />
                            <span className="text-white/60 text-xs">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TRUSTED BY ==================== */}
      <section className="py-16 bg-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8">
            Trusted by campaigns at every level across America
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            {logos.map((name) => (
              <div
                key={name}
                className="text-foreground/20 font-bold text-sm tracking-wide"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM / PAIN POINTS ==================== */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Your Campaign Is Running on
              <br />
              Duct Tape and Spreadsheets
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most campaigns juggle 5-7 disconnected tools, burn through cash on
              redundant subscriptions, and still don&apos;t have enough staff to
              execute. There&apos;s a better way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: "Fragmented Tech Stack",
                description:
                  "You're paying for a CRM, a texting tool, a dialer, analytics software, email platform, and a fundraising tool — none of which talk to each other.",
              },
              {
                icon: Users,
                title: "Understaffed & Overwhelmed",
                description:
                  "You need a data director, a digital director, and a field director. But your budget says you get one person doing all three jobs poorly.",
              },
              {
                icon: Clock,
                title: "Running Out of Time",
                description:
                  "Election day doesn't move. Every hour spent wrangling tools and data is an hour not spent talking to voters and raising money.",
              },
            ].map((pain) => (
              <div
                key={pain.title}
                className="text-center p-8 rounded-2xl bg-red-50/50 border border-red-100"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-100 text-red-500 mb-5">
                  <pain.icon size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3">{pain.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pain.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SOLUTION INTRO ==================== */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              The Solution
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              One Platform. Every Tool.
              <br />
              <span className="text-accent">AI-Powered.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Campaign OS brings together every tool your campaign needs into a
              single, AI-first platform. No more juggling logins, importing
              CSVs, or paying for tools that don&apos;t integrate.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="feature-card bg-white rounded-2xl p-8"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} mb-5`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
            >
              Explore all features
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== POWER OF 3 STAFFERS ==================== */}
      <section className="hero-gradient py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
                The ROI
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
                The Power of
                <br />
                <span className="text-accent animate-glow">
                  3 Full-Time Staffers
                </span>
              </h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                Campaign OS doesn&apos;t just save you money — it multiplies your
                capacity. Our AI handles the work of a data director, digital
                director, and field coordinator simultaneously, 24/7.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "AI Data Director: Voter targeting, predictive modeling, analytics dashboards",
                  "AI Digital Director: SMS campaigns, email sequences, social optimization",
                  "AI Field Coordinator: Phone banking, canvass lists, volunteer scheduling",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check size={12} className="text-accent" />
                    </div>
                    <p className="text-white/70 text-sm">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/pricing"
                className="btn-gold px-8 py-4 rounded-xl text-base inline-block"
              >
                See Pricing
                <ArrowRight size={18} className="inline ml-2" />
              </Link>
            </div>

            {/* Cost comparison */}
            <div className="space-y-6">
              {/* Traditional */}
              <div className="stat-card rounded-2xl p-6">
                <h4 className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4">
                  Traditional Campaign Stack
                </h4>
                <div className="space-y-3">
                  {[
                    { tool: "CRM Software", cost: "$300/mo" },
                    { tool: "Texting Platform", cost: "$500/mo" },
                    { tool: "Phone Dialer", cost: "$400/mo" },
                    { tool: "Analytics Tool", cost: "$200/mo" },
                    { tool: "Email Platform", cost: "$150/mo" },
                    { tool: "3 Staff Members", cost: "$12,000/mo" },
                  ].map((item) => (
                    <div
                      key={item.tool}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-white/50">{item.tool}</span>
                      <span className="text-white/70 font-mono line-through decoration-red-400">
                        {item.cost}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex justify-between">
                    <span className="text-white/50 font-semibold">Total</span>
                    <span className="text-red-400 font-bold font-mono">
                      $13,550/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Campaign OS */}
              <div className="bg-accent/10 border-2 border-accent rounded-2xl p-6 relative">
                <div className="absolute -top-3 right-6 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full">
                  SAVE 85%+
                </div>
                <h4 className="text-accent text-xs font-bold uppercase tracking-wider mb-4">
                  Campaign OS — All-in-One
                </h4>
                <div className="space-y-3">
                  {[
                    "AI CRM",
                    "Texting & P2P",
                    "AI Phone Banking",
                    "Voter Analytics",
                    "Email Campaigns",
                    "AI Staff (3x capacity)",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check size={14} className="text-accent" />
                      <span className="text-white/70">{item}</span>
                    </div>
                  ))}
                  <div className="border-t border-accent/20 pt-3 flex justify-between">
                    <span className="text-white/80 font-semibold">
                      Starting at
                    </span>
                    <span className="text-accent font-bold text-2xl font-mono">
                      $499/mo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="py-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl lg:text-5xl font-extrabold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm font-bold text-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Up and Running in Minutes
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              No complex onboarding. No IT department needed. Campaign OS gets
              you from zero to full-scale operations in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+60px)] w-[calc(100%-120px)] h-0.5 bg-border" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary mb-6">
                    <span className="text-accent text-3xl font-extrabold">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Campaigns That Won with Campaign OS
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="testimonial-card bg-white rounded-2xl p-8 border border-border"
              >
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-accent fill-accent"
                    />
                  ))}
                </div>
                <blockquote className="text-foreground/80 text-sm leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-muted-foreground text-xs">{t.title}</p>
                  <p className="text-accent text-xs font-semibold mt-1">
                    {t.race}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA ==================== */}
      <section className="hero-gradient py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Win Your Race.
            <br />
            <span className="text-accent">Start Today.</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join hundreds of campaigns across America already using Campaign OS.
            Get a personalized demo and see exactly how AI can transform your
            operation.
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
