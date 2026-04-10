import Link from "next/link";
import {
  BookOpen,
  Video,
  Download,
  ArrowRight,
  Mail,
  Clock,
  PenTool,
  BarChart3,
} from "lucide-react";

const categories = [
  { label: "All", active: true },
  { label: "Playbooks", active: false },
  { label: "Case Studies", active: false },
  { label: "Webinars", active: false },
  { label: "Blog", active: false },
];

const resources = [
  {
    category: "Case Study",
    icon: BarChart3,
    badgeColor: "bg-emerald-100 text-emerald-700",
    title: "How a First-Time Candidate Won with AI",
    description:
      "See how Campaign OS helped a school board candidate run a professional operation on a $5,000 budget.",
    time: "5 min read",
    cta: "Read Case Study",
  },
  {
    category: "Webinar",
    icon: Video,
    badgeColor: "bg-purple-100 text-purple-700",
    title: "AI Phone Banking: The Future of Voter Contact",
    description:
      "Watch our on-demand webinar to learn how AI is revolutionizing phone banking for political campaigns.",
    time: "45 min",
    cta: "Watch Now",
  },
  {
    category: "Blog",
    icon: PenTool,
    badgeColor: "bg-blue-100 text-blue-700",
    title: "5 Ways AI is Changing Campaign Strategy in 2026",
    description:
      "From predictive targeting to automated fundraising, discover how AI is reshaping modern political campaigns.",
    time: "8 min read",
    cta: "Read Article",
  },
  {
    category: "Playbook",
    icon: BookOpen,
    badgeColor: "bg-amber-100 text-amber-700",
    title: "The Digital Organizer's Handbook",
    description:
      "Everything you need to know about running a digital-first field program using texting, social media, and AI.",
    time: "12 min read",
    cta: "Read Playbook",
  },
  {
    category: "Case Study",
    icon: BarChart3,
    badgeColor: "bg-emerald-100 text-emerald-700",
    title: "Scaling Voter Outreach 10x with Campaign OS",
    description:
      "A state senate campaign's journey from 5,000 to 50,000 voter contacts per week using AI phone banking.",
    time: "7 min read",
    cta: "Read Case Study",
  },
  {
    category: "Blog",
    icon: PenTool,
    badgeColor: "bg-blue-100 text-blue-700",
    title: "FEC Compliance in the Age of AI Fundraising",
    description:
      "Navigate the regulatory landscape of AI-powered fundraising with our comprehensive compliance guide.",
    time: "10 min read",
    cta: "Read Article",
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* ==================== HERO ==================== */}
      <section className="bg-muted py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3">
            Resources
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Campaign Resources & Insights
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Guides, playbooks, and best practices to help you run a winning
            campaign.
          </p>
        </div>
      </section>

      {/* ==================== CATEGORY TABS ==================== */}
      <section className="py-8 border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <span
                key={cat.label}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  cat.active
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-border"
                }`}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED RESOURCE ==================== */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="feature-card bg-white rounded-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6 w-fit">
                  Playbook
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
                  The 2026 Campaign Technology Playbook
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  A comprehensive guide to building your campaign&apos;s tech
                  stack with AI. Learn how modern campaigns are using Campaign OS
                  to reach more voters, raise more money, and win more races.
                </p>
                <div>
                  <Link
                    href="#"
                    className="btn-gold px-8 py-4 rounded-xl text-base inline-flex items-center gap-2"
                  >
                    <Download size={18} />
                    Download Free
                  </Link>
                </div>
              </div>
              {/* Visual placeholder */}
              <div className="bg-primary/5 flex items-center justify-center min-h-[280px] lg:min-h-0">
                <div className="w-48 h-64 lg:w-56 lg:h-72 bg-primary/10 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-primary/20">
                  <BookOpen size={48} className="text-primary/40" />
                  <div className="text-center px-4">
                    <p className="text-primary/60 font-bold text-sm">
                      2026 Playbook
                    </p>
                    <p className="text-primary/40 text-xs mt-1">
                      Campaign Technology Guide
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RESOURCE GRID ==================== */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.title}
                className="feature-card bg-white rounded-2xl p-8 flex flex-col"
              >
                {/* Category badge */}
                <span
                  className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5 w-fit ${resource.badgeColor}`}
                >
                  {resource.category}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold mb-3 leading-snug">
                  {resource.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                  {resource.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <Clock size={14} />
                    <span>{resource.time}</span>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:text-accent transition-colors"
                  >
                    {resource.cta}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== NEWSLETTER SIGNUP ==================== */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/20 text-accent mb-6">
              <Mail size={28} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Stay Ahead of the Curve
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Get campaign tech insights delivered to your inbox every week.
            </p>
            <form
              action="#"
              className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full flex-1 px-5 py-3.5 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
              />
              <button
                type="submit"
                className="btn-gold px-8 py-3.5 rounded-xl text-base whitespace-nowrap w-full sm:w-auto"
              >
                Subscribe
              </button>
            </form>
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
            Ready to Put These
            <br />
            <span className="text-accent">Strategies into Action?</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            See Campaign OS in action.
          </p>
          <Link
            href="/demo"
            className="btn-gold px-10 py-4 rounded-xl text-lg inline-flex items-center gap-2"
          >
            Request a Demo
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
