import Link from "next/link";
import Image from "next/image";

const productLinks = [
  { label: "Campaign OS", href: "/product" },
  { label: "AI CRM", href: "/product#crm" },
  { label: "Texting & P2P", href: "/product#texting" },
  { label: "Phone Banking", href: "/product#phonebank" },
  { label: "Voter Analytics", href: "/product#analytics" },
  { label: "Fundraising", href: "/product#fundraising" },
  { label: "Integrations", href: "/product#integrations" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Request a Demo", href: "/demo" },
  { label: "Careers", href: "/about#careers" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "FEC Compliance", href: "/compliance" },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Image
              src="/logo-white.svg"
              alt="Campaign Institute"
              width={200}
              height={60}
              className="h-10 w-auto mb-5"
            />
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              The most advanced AI-powered campaign platform. Built for modern
              campaigns that need to do more with less.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 rounded-full px-3 py-1.5 text-white/80">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                SOC 2 Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 rounded-full px-3 py-1.5 text-white/80">
                FEC Approved
              </span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-3">
                Contact
              </h4>
              <a
                href="mailto:hello@campaigninstitute.com"
                className="text-sm text-white/60 hover:text-accent transition-colors"
              >
                hello@campaigninstitute.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Campaign Institute. All rights
            reserved.
          </p>
          <p className="text-xs text-white/40">
            Made in Washington, D.C. for campaigns across America.
          </p>
        </div>
      </div>
    </footer>
  );
}
