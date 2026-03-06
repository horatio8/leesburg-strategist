import type { EmailCampaignEmail, BrandKit } from "@/lib/types";

/**
 * Renders a complete inline-styled HTML email from an EmailCampaignEmail and optional BrandKit.
 * Uses table-based layout for maximum email client compatibility.
 */
export function renderEmailHtml(
  email: EmailCampaignEmail,
  brandKit: BrandKit | null
): string {
  const colors = brandKit?.colors || {};
  const fonts = brandKit?.fonts || {};

  const primaryColor = colors.primary || "#2563eb";
  const backgroundColor = colors.background || "#f8fafc";
  const textColor = colors.text || "#1e293b";
  const mutedColor = colors.muted || "#64748b";
  const headingFont = fonts.heading || fonts.primary || "Georgia, serif";
  const bodyFont = fonts.body || fonts.secondary || "Arial, Helvetica, sans-serif";

  const bodyParagraphs = (email.body || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${textColor}; font-family: ${bodyFont};">${p.replace(/\n/g, "<br>")}</p>`
    )
    .join("");

  const introHtml = email.introduction
    ? `<p style="margin: 0 0 20px 0; font-size: 18px; line-height: 1.6; color: ${textColor}; font-family: ${bodyFont}; font-weight: 500;">${email.introduction.replace(/\n/g, "<br>")}</p>`
    : "";

  const signatureHtml = email.signature
    ? `<p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.5; color: ${mutedColor}; font-family: ${bodyFont};">${email.signature.replace(/\n/g, "<br>")}</p>`
    : "";

  const ctaHtml =
    email.cta_text && email.cta_url
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
          <tr>
            <td style="border-radius: 8px; background-color: ${primaryColor};">
              <a href="${email.cta_url}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none; font-family: ${bodyFont}; border-radius: 8px;">${email.cta_text}</a>
            </td>
          </tr>
        </table>`
      : "";

  const headingImageHtml = email.heading_image_url
    ? `<img src="${email.heading_image_url}" alt="Email header" width="600" height="300" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" />`
    : `<div style="width: 100%; height: 300px; max-width: 600px; background: linear-gradient(135deg, ${primaryColor}22, ${primaryColor}44); display: flex; align-items: center; justify-content: center;">
        <p style="margin: 0; font-size: 14px; color: ${mutedColor}; font-family: ${bodyFont}; text-align: center; padding: 20px;">${email.heading_image_prompt || "Header image"}</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${email.subject || "Email"}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: ${bodyFont};">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${email.preview_text || ""}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${backgroundColor};">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <!-- Email container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header image -->
          <tr>
            <td style="padding: 0;">
              ${headingImageHtml}
            </td>
          </tr>

          <!-- Subject as heading -->
          <tr>
            <td class="email-padding" style="padding: 32px 40px 0 40px;">
              <h1 style="margin: 0 0 24px 0; font-size: 24px; line-height: 1.3; color: ${textColor}; font-family: ${headingFont}; font-weight: 700;">${email.subject}</h1>
            </td>
          </tr>

          <!-- Introduction -->
          ${introHtml ? `<tr><td class="email-padding" style="padding: 0 40px;">${introHtml}</td></tr>` : ""}

          <!-- Body -->
          <tr>
            <td class="email-padding" style="padding: 0 40px;">
              ${bodyParagraphs}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td class="email-padding" style="padding: 0 40px;" align="center">
              ${ctaHtml}
            </td>
          </tr>

          <!-- Signature -->
          ${signatureHtml ? `<tr><td class="email-padding" style="padding: 0 40px 32px 40px;">${signatureHtml}</td></tr>` : `<tr><td style="padding: 0 0 32px 0;"></td></tr>`}

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="email-padding" style="padding: 20px 40px 24px 40px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 1.4; color: ${mutedColor}; font-family: ${bodyFont};">
                You are receiving this email because you opted in to communications.
              </p>
              <p style="margin: 0; font-size: 12px; line-height: 1.4; color: ${mutedColor}; font-family: ${bodyFont};">
                <a href="#unsubscribe" style="color: ${primaryColor}; text-decoration: underline;">Unsubscribe</a> &nbsp;|&nbsp;
                <a href="#preferences" style="color: ${primaryColor}; text-decoration: underline;">Update Preferences</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
