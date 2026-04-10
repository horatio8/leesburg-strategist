import Link from "next/link";
import {
  Check,
  Minus,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Phone,
} from "lucide-react";

export const metadata = {
  title: "Pricing - Campaign OS | Campaign Institute",
  description:
    "Simple, transparent pricing for Campaign OS. Plans for every campaign, from school board to Congress.",
};

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const tiers = [
  {
    name: "Starter",
    price: "$499",
    period: "/mo",
    description: "For local and down-ballot campaigns",
    featured: false,
    cta: "Start Free Trial",
    ctaHref: "/demo",
    features: [
      "Up to 25,000 voter records",
      "AI CRM with basic enrichment",
      "5,000 texts/month",
      "1,000 AI phone calls/month",
      "Basic voter analytics",
      "Email campaigns",
      "2 user seats",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$999",
    period: "/mo",
    description: "For competitive state & federal races",
    featured: true,
    badge: "Most Popular",
    cta: "Start Free Trial",
    ctaHref: "/demo",
    features: [
      "Up to 250,000 voter records",
      "AI CRM with full enrichment",
      "25,000 texts/month",
      "10,000 AI phone calls/month",
      "Advanced voter analytics & modeling",
      "AI Strategy Engine",
      "Fundraising suite with FEC reporting",
      "10 user seats",
      "Priority support + onboarding",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For statewide, presidential & party orgs",
    featured: false,
    cta: "Contact Sales",
    ctaHref: "/demo",
    features: [
      "Unlimited voter records",
      "Everything in Pro",
      "Unlimited texting & calls",
      "Custom AI model training",
      "Dedicated account manager",
      "White-label options",
      "API access",
      "SSO & advanced security",
      "Unlimited seats",
    ],
  },
];

type FeatureValue = boolean | string;

interface ComparisonRow {
  feature: string;
  starter: FeatureValue;
  pro: FeatureValue;
  enterprise: FeatureValue;
}

interface ComparisonCategory {
  category: string;
  rows: ComparisonRow[];
}

const comparisonData: ComparisonCategory[] = [
  {
    category: "Core Platform",
    rows: [
      { feature: "Voter Records", starter: "25,000", pro: "250,000", enterprise: "Unlimited" },
      { feature: "AI CRM", starter: "Basic", pro: "Full", enterprise: "Full" },
      { feature: "Data Enrichment", starter: "Basic", pro: "Full", enterprise: "Full + Custom" },
      { feature: "User Seats", starter: "2", pro: "10", enterprise: "Unlimited" },
      { feature: "Data Imports (CSV, VAN, L2)", starter: true, pro: true, enterprise: true },
      { feature: "AI Strategy Engine", starter: false, pro: true, enterprise: true },
      { feature: "Custom AI Model Training", starter: false, pro: false, enterprise: true },
      { feature: "API Access", starter: false, pro: false, enterprise: true },
      { feature: "White-Label Options", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Voter Contact",
    rows: [
      { feature: "Texts per Month", starter: "5,000", pro: "25,000", enterprise: "Unlimited" },
      { feature: "AI Phone Calls per Month", starter: "1,000", pro: "10,000", enterprise: "Unlimited" },
      { feature: "Email Campaigns", starter: true, pro: true, enterprise: true },
      { feature: "Peer-to-Peer SMS", starter: true, pro: true, enterprise: true },
      { feature: "Broadcast Messaging", starter: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Analytics",
    rows: [
      { feature: "Basic Voter Analytics", starter: true, pro: true, enterprise: true },
      { feature: "Predictive Modeling", starter: false, pro: true, enterprise: true },
      { feature: "Micro-Targeting", starter: false, pro: true, enterprise: true },
      { feature: "Real-Time Dashboards", starter: false, pro: true, enterprise: true },
      { feature: "Custom Reports", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Fundraising",
    rows: [
      { feature: "Donor Management", starter: false, pro: true, enterprise: true },
      { feature: "FEC Compliance Reporting", starter: false, pro: true, enterprise: true },
      { feature: "AI Donation Optimization", starter: false, pro: true, enterprise: true },
      { feature: "Custom Fundraising Pages", starter: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    rows: [
      { feature: "Email Support", starter: true, pro: true, enterprise: true },
      { feature: "Priority Support", starter: false, pro: true, enterprise: true },
      { feature: "Onboarding Assistance", starter: false, pro: true, enterprise: true },
      { feature: "Dedicated Account Manager", starter: false, pro: false, enterprise: true },
      { feature: "SSO & Advanced Security", starter: false, pro: false, enterprise: true },
    ],
  },
];

const faqs = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes! We offer a 14-day free trial on both the Starter and Pro plans. No credit card required to get started. You'll have full access to all plan features during the trial period.",
  },
  {
    question: "Can I switch plans?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Is Campaign OS FEC compliant?",
    answer:
      "Yes. Campaign OS is fully compliant with Federal Election Commission regulations. Our Pro and Enterprise plans include built-in FEC reporting tools that automatically generate the required filings and track contribution limits.",
  },
  {
    question: "Do I need technical skills to use Campaign OS?",
    answer:
      "Not at all. Campaign OS is designed for campaign staff, not engineers. The intuitive interface lets you import voter data, launch outreach, and analyze results without any coding or technical expertise.",
  },
  {
    question: "What data formats can I import?",
    answer:
      "Campaign OS supports all major political data formats including CSV files, VAN exports, L2 voter files, Aristotle data, and more. Our import wizard auto-maps fields so you can get up and running in minutes.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Security is our top priority. Campaign OS is SOC 2 certified, all data is encrypted at rest and in transit, and we never share or sell your voter data. Enterprise plans include SSO and advanced security controls.",
  },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
        <Check className="w-4 h-4" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400">
        <Minus className="w-4 h-4" />
      </span>
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-accent font-semibold tracking-wide uppercase text-sm mb-4">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Plans for every campaign, from school board to Congress.
          </p>
        </div>
      </section>

      {/* ── Pricing Tiers ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`pricing-card${tier.featured ? " featured" : ""} rounded-2xl bg-white p-8 flex flex-col`}
              >
                {/* Badge */}
                {tier.featured && (
                  <div className="flex justify-center -mt-12 mb-6">
                    <span className="inline-flex items-center gap-1.5 bg-accent text-primary text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                      <Sparkles className="w-4 h-4" />
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={tier.featured ? "" : "pt-0"}>
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mt-6 mb-8">
                  <span className="text-5xl font-extrabold text-foreground">{tier.price}</span>
                  {tier.period && (
                    <span className="text-lg text-gray-500 ml-1">{tier.period}</span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={tier.ctaHref}
                  className={`block text-center rounded-xl py-3.5 px-6 text-base font-bold transition ${
                    tier.featured
                      ? "btn-gold"
                      : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                  }`}
                >
                  {tier.cta}
                  {tier.cta === "Contact Sales" && <ArrowRight className="inline ml-2 w-4 h-4" />}
                </Link>

                {/* Divider */}
                <hr className="my-8 border-gray-200" />

                {/* Features */}
                <ul className="space-y-4 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm text-gray-700">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Comparison Table ──────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Compare Plans in Detail
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              See exactly what you get with every plan.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left min-w-[640px]">
              {/* Table Head */}
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-5 px-6 text-sm font-semibold text-gray-500 w-2/5">
                    Feature
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-semibold text-foreground w-1/5">
                    Starter
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-semibold text-foreground w-1/5 bg-accent/5">
                    Pro
                  </th>
                  <th className="py-5 px-4 text-center text-sm font-semibold text-foreground w-1/5">
                    Enterprise
                  </th>
                </tr>
              </thead>

              <tbody>
                {comparisonData.map((cat) => (
                  <>
                    {/* Category Header */}
                    <tr key={cat.category} className="bg-gray-50">
                      <td
                        colSpan={4}
                        className="py-3 px-6 text-xs font-bold tracking-wider text-primary uppercase"
                      >
                        {cat.category}
                      </td>
                    </tr>

                    {cat.rows.map((row, idx) => (
                      <tr
                        key={row.feature}
                        className={idx < cat.rows.length - 1 ? "border-b border-gray-100" : "border-b border-gray-200"}
                      >
                        <td className="py-4 px-6 text-sm text-gray-700">{row.feature}</td>
                        <td className="py-4 px-4 text-center">
                          <FeatureCell value={row.starter} />
                        </td>
                        <td className="py-4 px-4 text-center bg-accent/5">
                          <FeatureCell value={row.pro} />
                        </td>
                        <td className="py-4 px-4 text-center">
                          <FeatureCell value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-gray-600 text-lg">
              Everything you need to know about Campaign OS pricing.
            </p>
          </div>

          <dl className="space-y-8">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="border border-gray-200 rounded-2xl p-6 hover:border-accent/50 transition"
              >
                <dt className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-base font-semibold text-foreground">
                    {faq.question}
                  </span>
                </dt>
                <dd className="mt-3 ml-8 text-sm text-gray-600 leading-relaxed">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="hero-gradient py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Not Sure Which Plan?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Our team will help you find the right fit for your campaign. Get a
            personalized walkthrough and pricing recommendation.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="btn-gold rounded-xl py-3.5 px-8 text-base font-bold inline-flex items-center gap-2"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="btn-outline-light rounded-xl py-3.5 px-8 text-base inline-flex items-center gap-2"
            >
              Book a Demo
              <Phone className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
