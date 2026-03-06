"use client";

import type { EmailCampaignEmail, BrandKit } from "@/lib/types";

interface EmailPreviewProps {
  email: EmailCampaignEmail;
  brandKit: BrandKit | null;
}

export default function EmailPreview({ email, brandKit }: EmailPreviewProps) {
  const colors = brandKit?.colors || {};
  const fonts = brandKit?.fonts || {};

  const primaryColor = colors.primary || "#2563eb";
  const textColor = colors.text || "#1e293b";
  const mutedColor = colors.muted || "#64748b";
  const headingFont = fonts.heading || fonts.primary || "Georgia, serif";
  const bodyFont =
    fonts.body || fonts.secondary || "Arial, Helvetica, sans-serif";

  const bodyParagraphs = (email.body || "")
    .split(/\n\n+/)
    .filter(Boolean);

  return (
    <div
      className="mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      style={{ maxWidth: 600, fontFamily: bodyFont }}
    >
      {/* Header image */}
      {email.heading_image_url ? (
        <img
          src={email.heading_image_url}
          alt="Email header"
          className="w-full object-cover"
          style={{ maxHeight: 300 }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center"
          style={{
            height: 300,
            background: `linear-gradient(135deg, ${primaryColor}22, ${primaryColor}44)`,
          }}
        >
          <p
            className="text-center px-6"
            style={{ color: mutedColor, fontSize: 13 }}
          >
            {email.heading_image_prompt || "Header image placeholder"}
          </p>
        </div>
      )}

      {/* Content area */}
      <div style={{ padding: "32px 40px" }}>
        {/* Subject as heading */}
        <h1
          style={{
            margin: "0 0 20px 0",
            fontSize: 22,
            lineHeight: 1.3,
            color: textColor,
            fontFamily: headingFont,
            fontWeight: 700,
          }}
        >
          {email.subject || "Subject Line"}
        </h1>

        {/* Introduction */}
        {email.introduction && (
          <p
            style={{
              margin: "0 0 18px 0",
              fontSize: 16,
              lineHeight: 1.6,
              color: textColor,
              fontWeight: 500,
            }}
          >
            {email.introduction}
          </p>
        )}

        {/* Body */}
        {bodyParagraphs.map((paragraph, idx) => (
          <p
            key={idx}
            style={{
              margin: "0 0 14px 0",
              fontSize: 15,
              lineHeight: 1.6,
              color: textColor,
            }}
          >
            {paragraph}
          </p>
        ))}

        {/* CTA Button */}
        {email.cta_text && (
          <div style={{ textAlign: "center", margin: "28px 0" }}>
            <span
              style={{
                display: "inline-block",
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 700,
                color: "#ffffff",
                backgroundColor: primaryColor,
                borderRadius: 8,
                textDecoration: "none",
                cursor: "pointer",
              }}
            >
              {email.cta_text}
            </span>
          </div>
        )}

        {/* Signature */}
        {email.signature && (
          <p
            style={{
              margin: "24px 0 0 0",
              fontSize: 13,
              lineHeight: 1.5,
              color: mutedColor,
              whiteSpace: "pre-line",
            }}
          >
            {email.signature}
          </p>
        )}
      </div>

      {/* Footer / Unsubscribe */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "16px 40px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: mutedColor }}>
          You are receiving this email because you opted in to communications.
        </p>
        <p style={{ margin: "6px 0 0 0", fontSize: 11, color: mutedColor }}>
          <span style={{ color: primaryColor, textDecoration: "underline", cursor: "pointer" }}>
            Unsubscribe
          </span>{" "}
          |{" "}
          <span style={{ color: primaryColor, textDecoration: "underline", cursor: "pointer" }}>
            Update Preferences
          </span>
        </p>
      </div>
    </div>
  );
}
