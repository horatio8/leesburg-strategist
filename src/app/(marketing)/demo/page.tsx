"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Quote,
  ArrowRight,
} from "lucide-react";

const roles = [
  "Campaign Manager",
  "Candidate",
  "Political Director",
  "Field Director",
  "Finance Director",
  "Consultant",
  "Other",
];

const raceTypes = [
  "Federal",
  "Statewide",
  "State Legislature",
  "Local / Municipal",
  "Ballot Initiative",
  "PAC / Issue Org",
  "Other",
];

const demoFeatures = [
  "Personalized walkthrough of Campaign OS",
  "Custom strategy for your specific race",
  "ROI analysis vs. your current tools",
  "Live Q&A with a campaign tech specialist",
  "No commitment required",
];

const testimonials = [
  {
    quote:
      "Campaign OS transformed how we run our field operation. We reached 3x more voters in half the time.",
    name: "Sarah M.",
    role: "Campaign Manager, U.S. House Race",
  },
  {
    quote:
      "The AI strategy engine alone saved us hundreds of hours of planning. An absolute game-changer.",
    name: "David R.",
    role: "Political Director, State Senate",
  },
  {
    quote:
      "We switched from three separate tools to Campaign OS and cut our monthly software costs by 60%.",
    name: "Maria L.",
    role: "Finance Director, Statewide Campaign",
  },
];

const inputClasses =
  "w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition bg-white";

const labelClasses = "text-sm font-semibold text-foreground mb-1.5 block";

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* ───── Left Column: Form ───── */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              See Campaign OS in Action
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-lg">
              Get a personalized demo and see how AI can transform your campaign
              operation.
            </p>

            {submitted ? (
              /* ── Success State ── */
              <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Demo Request Received!
                </h2>
                <p className="mt-3 text-muted-foreground">
                  We&apos;ll be in touch within 24 hours.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check your inbox for a confirmation email with next steps.
                </p>
                <Link
                  href="/"
                  className="btn-gold mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold"
                >
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* ── Form ── */
              <form
                onSubmit={handleSubmit}
                className="mt-10 space-y-5 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm"
              >
                {/* Name row */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="firstName" className={labelClasses}>
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      placeholder="Jane"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className={labelClasses}>
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      placeholder="Doe"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="jane@campaign.com"
                    className={inputClasses}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={labelClasses}>
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="(202) 555-0100"
                    className={inputClasses}
                  />
                </div>

                {/* Organization */}
                <div>
                  <label htmlFor="organization" className={labelClasses}>
                    Organization / Campaign Name
                  </label>
                  <input
                    id="organization"
                    type="text"
                    required
                    placeholder="Citizens for Progress"
                    className={inputClasses}
                  />
                </div>

                {/* Role & Race Type row */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="role" className={labelClasses}>
                      Role
                    </label>
                    <select id="role" required className={inputClasses}>
                      <option value="" disabled selected>
                        Select your role
                      </option>
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="raceType" className={labelClasses}>
                      Race Type
                    </label>
                    <select id="raceType" required className={inputClasses}>
                      <option value="" disabled selected>
                        Select race type
                      </option>
                      {raceTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* How did you hear */}
                <div>
                  <label htmlFor="referral" className={labelClasses}>
                    How did you hear about us?{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="referral"
                    type="text"
                    placeholder="Google, colleague, conference, etc."
                    className={inputClasses}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-gold w-full rounded-xl px-6 py-3.5 text-sm font-bold cursor-pointer"
                >
                  Request Your Demo
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting this form you agree to our{" "}
                  <Link href="/privacy" className="underline hover:text-accent">
                    Privacy Policy
                  </Link>
                  . We&apos;ll never share your information.
                </p>
              </form>
            )}
          </div>

          {/* ───── Right Column: Benefits & Info ───── */}
          <div className="space-y-8 lg:sticky lg:top-28">
            {/* What you'll get */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-5">
                What you&apos;ll get in your demo:
              </h2>
              <ul className="space-y-4">
                {demoFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/20">
                      <Check className="h-4 w-4 text-accent-foreground" />
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trusted by */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-5">
                Trusted by 500+ campaigns
              </h3>
              <div className="space-y-5">
                {testimonials.map((t) => (
                  <div
                    key={t.name}
                    className="relative rounded-xl bg-muted/60 p-4"
                  >
                    <Quote className="absolute top-3 right-3 h-5 w-5 text-accent/40" />
                    <p className="text-sm text-foreground italic leading-relaxed pr-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="mt-3 text-xs font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Get in touch directly
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="h-5 w-5 text-accent" />
                  <a
                    href="mailto:hello@campaigninstitute.com"
                    className="hover:text-accent transition"
                  >
                    hello@campaigninstitute.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-foreground">
                  <Phone className="h-5 w-5 text-accent" />
                  <a
                    href="tel:+12025550187"
                    className="hover:text-accent transition"
                  >
                    (202) 555-0187
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-5 w-5 text-accent" />
                  Based in Washington, D.C.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
