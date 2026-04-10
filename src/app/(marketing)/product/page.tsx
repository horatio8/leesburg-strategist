import Link from "next/link";
import {
  Users,
  MessageSquare,
  Phone,
  BarChart3,
  DollarSign,
  Brain,
  Check,
  ArrowRight,
  Shield,
  Lock,
  KeyRound,
  Zap,
  Layers,
} from "lucide-react";

const featureSections = [
  {
    id: "crm",
    icon: Users,
    title: "AI-Powered CRM",
    headline: "Smart Voter Management That Works While You Sleep",
    description:
      "Forget spreadsheets and outdated databases. Campaign OS CRM automatically enriches voter profiles, tracks every interaction, and uses predictive scoring to surface your best opportunities — so your team focuses on the voters who matter most.",
    capabilities: [
      "Auto-enrichment of voter records with demographic, behavioral, and social data",
      "Predictive supporter scoring that updates in real time as new data flows in",
      "Relationship mapping that surfaces hidden connections across your voter universe",
      "Full interaction timeline across calls, texts, doors, events, and donations",
      "Smart deduplication and merge engine to keep your data clean automatically",
    ],
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    id: "texting",
    icon: MessageSquare,
    title: "Texting & P2P",
    headline: "Reach Thousands of Voters in Minutes, Not Weeks",
    description:
      "Whether you need broadcast SMS to hit your full voter file or peer-to-peer texting for personal conversations, Campaign OS handles it all with AI-drafted messages, built-in compliance, and real-time delivery analytics.",
    capabilities: [
      "Broadcast SMS campaigns to your entire voter file with one click",
      "Peer-to-peer texting with AI-suggested responses for faster volunteer throughput",
      "AI-drafted messages tailored to voter segments, issues, and tone preferences",
      "Automatic opt-out management and TCPA/carrier compliance built in",
      "Real-time delivery analytics with response rates, opt-out tracking, and A/B results",
    ],
    color: "bg-emerald-50 text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    id: "phonebank",
    icon: Phone,
    title: "AI Phone Banking",
    headline: "A Virtual Call Center That Never Clocks Out",
    description:
      "Campaign OS AI agents conduct natural-sounding voter conversations at massive scale — handling surveys, voter ID, persuasion, and GOTV calls 24/7. No volunteer recruitment needed, no phone bank pizza budget required.",
    capabilities: [
      "AI-powered virtual call center that handles thousands of simultaneous conversations",
      "Natural-sounding voices with dynamic responses — not robocalls or pre-recorded scripts",
      "Voter ID, survey, persuasion, and GOTV call programs configurable in minutes",
      "24/7 operation with automatic timezone-aware scheduling and callback management",
      "Multilingual support for Spanish, Mandarin, Vietnamese, and more",
    ],
    color: "bg-purple-50 text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Voter Analytics & Targeting",
    headline: "See Your District Like Never Before",
    description:
      "Move beyond gut instincts and yard-sign counts. Campaign OS uses predictive modeling and AI-driven micro-targeting to identify persuadable voters, optimize turf cuts, and give you real-time dashboards that show exactly where your campaign stands.",
    capabilities: [
      "Predictive modeling that scores every voter for turnout likelihood and persuadability",
      "AI micro-targeting that builds optimized voter segments for each outreach channel",
      "Turf optimization that generates the most efficient walk lists and canvass routes",
      "Real-time dashboards showing voter contacts, sentiment shifts, and campaign momentum",
      "Sentiment analysis across conversations, texts, and social signals",
    ],
    color: "bg-orange-50 text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    id: "fundraising",
    icon: DollarSign,
    title: "Fundraising & Compliance",
    headline: "Raise More Money. File on Time. Every Time.",
    description:
      "Campaign OS automates the entire fundraising lifecycle — from AI-optimized donor asks to FEC-compliant reporting. Connect ActBlue or WinRed, manage recurring donors, and never miss a filing deadline again.",
    capabilities: [
      "Donor management with lifetime value tracking, lapsed donor alerts, and giving history",
      "Automated FEC reporting with pre-filled forms, deadline reminders, and audit trails",
      "AI-optimized ask amounts and timing based on donor behavior and giving patterns",
      "Recurring donation management with smart upgrade suggestions and churn prevention",
      "Native ActBlue and WinRed integration with real-time transaction syncing",
    ],
    color: "bg-pink-50 text-pink-600",
    iconBg: "bg-pink-100",
  },
  {
    id: "integrations",
    icon: Brain,
    title: "AI Strategy Engine",
    headline: "Your Smartest Strategist Is Always On Call",
    description:
      "Campaign OS doesn't just execute — it thinks. The AI Strategy Engine generates messaging frameworks, conducts opposition research, builds tactical plans, and produces Leesburg Grid analyses that would take a seasoned consultant days to deliver.",
    capabilities: [
      "AI-generated messaging frameworks tailored to your district, issues, and opponent",
      "Opposition research synthesis with vulnerability scoring and attack/defense matrices",
      "Tactical campaign planning with timeline, resource allocation, and milestone tracking",
      "Automated Leesburg Grid generation for rapid message testing and refinement",
      "A/B testing recommendations for messaging, channels, and audience segments",
    ],
    color: "bg-indigo-50 text-indigo-600",
    iconBg: "bg-indigo-100",
  },
];

const integrations = [
  "NGP VAN",
  "L2",
  "Aristotle",
  "ActBlue",
  "WinRed",
  "Mailchimp",
  "Google Workspace",
  "Slack",
];

const securityFeatures = [
  {
    icon: Shield,
    title: "SOC 2 Compliant",
    description:
      "Enterprise-grade security controls audited annually by independent third parties.",
  },
  {
    icon: Check,
    title: "FEC Compliance Built In",
    description:
      "Automated reporting, contribution limits, and donor verification baked into every workflow.",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description:
      "All voter data, communications, and financial records encrypted at rest and in transit.",
  },
  {
    icon: KeyRound,
    title: "Role-Based Access",
    description:
      "Granular permissions so volunteers, staff, and consultants only see what they need.",
  },
];

export default function ProductPage() {
  return (
    <>
      {/* ==================== PRODUCT HERO ==================== */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Zap size={14} className="text-accent" />
              <span className="text-white/80 text-sm font-medium">
                Product
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Campaign OS
            </h1>

            <p className="text-xl sm:text-2xl text-accent font-semibold mb-6">
              The All-in-One AI Campaign Platform
            </p>

            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              CRM, texting, phone banking, voter analytics, fundraising, and
              AI-powered strategy — unified in a single platform built
              exclusively for political campaigns.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="btn-gold px-8 py-4 rounded-xl text-base sm:text-lg w-full sm:w-auto"
              >
                Request a Demo
                <ArrowRight size={18} className="inline ml-2" />
              </Link>
              <Link
                href="/pricing"
                className="btn-outline-light px-8 py-4 rounded-xl text-base sm:text-lg w-full sm:w-auto text-center"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PLATFORM OVERVIEW ==================== */}
      <section className="py-20 lg:py-32 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Unified Platform
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Everything Your Campaign Needs.
              <br />
              <span className="text-accent">Nothing It Doesn&apos;t.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Campaign OS replaces your fragmented tech stack with one integrated
              platform. Every tool shares the same data, the same AI engine, and
              the same dashboard — so nothing falls through the cracks.
            </p>
          </div>

          {/* Platform hub visual */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white rounded-2xl border border-border p-8 lg:p-12 shadow-sm">
              {/* Center hub */}
              <div className="flex items-center justify-center mb-10">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Layers size={40} className="text-accent" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-primary text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Campaign OS
                  </div>
                </div>
              </div>

              {/* Connected modules */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {featureSections.map((feature) => (
                  <Link
                    key={feature.id}
                    href={`#${feature.id}`}
                    className="feature-card flex items-center gap-3 rounded-xl p-4 bg-muted hover:bg-white transition-colors group"
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg ${feature.iconBg} ${feature.color} flex items-center justify-center`}
                    >
                      <feature.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">
                        {feature.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-8">
                All modules share a unified data layer, AI engine, and real-time
                sync — no CSV imports, no API keys, no duct tape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURE SECTIONS ==================== */}
      {featureSections.map((feature, index) => {
        const isEven = index % 2 === 0;
        const bgClass = isEven ? "bg-white" : "bg-muted";

        return (
          <section
            key={feature.id}
            id={feature.id}
            className={`py-20 lg:py-28 ${bgClass} scroll-mt-20`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  isEven ? "" : "lg:[direction:rtl]"
                }`}
              >
                {/* Text content */}
                <div className={isEven ? "" : "lg:[direction:ltr]"}>
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.color} ${feature.iconBg} mb-6`}
                  >
                    <feature.icon size={28} />
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                    {feature.title}
                  </h2>

                  <p className="text-lg font-semibold text-primary/80 mb-4">
                    {feature.headline}
                  </p>

                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {feature.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {feature.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                          <Check size={12} className="text-accent" />
                        </div>
                        <span className="text-sm text-foreground/80 leading-relaxed">
                          {cap}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors text-sm"
                  >
                    See {feature.title} in action
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Visual placeholder */}
                <div className={isEven ? "" : "lg:[direction:ltr]"}>
                  <div
                    className={`rounded-2xl p-8 lg:p-10 ${
                      isEven
                        ? "bg-muted border border-border"
                        : "bg-white border border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-10 h-10 rounded-lg ${feature.iconBg} ${feature.color} flex items-center justify-center`}
                      >
                        <feature.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Campaign OS Module
                        </p>
                      </div>
                    </div>

                    {/* Mock UI elements */}
                    <div className="space-y-3">
                      {feature.capabilities.slice(0, 3).map((cap, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-white/80 rounded-lg p-3 border border-border/50"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs text-muted-foreground truncate">
                            {cap.split(" ").slice(0, 5).join(" ")}...
                          </span>
                          <span className="ml-auto text-xs font-medium text-green-600">
                            Active
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-primary/5 p-4 text-center">
                        <p className="text-2xl font-extrabold text-primary">
                          {
                            [
                              "147K",
                              "89K",
                              "52K",
                              "340K",
                              "$284K",
                              "28",
                            ][index]
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {
                            [
                              "Records",
                              "Sent",
                              "Calls",
                              "Scored",
                              "Raised",
                              "Strategies",
                            ][index]
                          }
                        </p>
                      </div>
                      <div className="rounded-lg bg-accent/10 p-4 text-center">
                        <p className="text-2xl font-extrabold text-accent">
                          {["+12%", "94%", "24/7", "98%", "+31%", "3x"][index]}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {
                            [
                              "Growth",
                              "Delivered",
                              "Uptime",
                              "Accuracy",
                              "More Raised",
                              "Faster",
                            ][index]
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ==================== INTEGRATIONS ==================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
              Integrations
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Works With Your Existing Tools
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Campaign OS connects to the platforms you already rely on. Import
              data, sync contacts, and keep your workflows intact — no rip and
              replace required.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {integrations.map((name) => (
              <div
                key={name}
                className="feature-card flex items-center justify-center rounded-xl bg-muted border border-border p-6 text-center"
              >
                <p className="text-sm font-bold text-foreground">{name}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don&apos;t see your tool?{" "}
            <Link
              href="/demo"
              className="text-primary font-semibold hover:text-accent transition-colors"
            >
              Talk to us
            </Link>{" "}
            — we&apos;re adding new integrations every month.
          </p>
        </div>
      </section>

      {/* ==================== SECURITY & COMPLIANCE ==================== */}
      <section className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary text-accent mb-6">
              <Shield size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Security & Compliance
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Campaign data is sensitive. We treat it that way. Campaign OS is
              built from the ground up with enterprise-grade security and
              political compliance at its core.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {securityFeatures.map((item) => (
              <div
                key={item.title}
                className="feature-card bg-white rounded-2xl p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                  <item.icon size={24} />
                </div>
                <h3 className="text-sm font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BOTTOM CTA ==================== */}
      <section className="hero-gradient py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to Transform
            <br />
            <span className="text-accent">Your Campaign?</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            See Campaign OS in action. Get a personalized demo tailored to your
            race, your district, and your goals — and discover why campaigns
            across America are making the switch.
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
