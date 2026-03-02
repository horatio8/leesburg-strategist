/**
 * Google Imagen 3 API wrapper via Gemini API
 *
 * Uses the generativelanguage.googleapis.com endpoint for image generation.
 * Requires GOOGLE_GEMINI_API_KEY environment variable.
 */

export interface ImagenRequest {
  prompt: string;
  aspect_ratio?: "1:1" | "9:16" | "16:9" | "4:5" | "3:4";
  number_of_images?: number;
}

export interface ImagenResponse {
  images: Array<{
    base64: string;
    mime_type: string;
  }>;
}

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export async function generateImage(
  request: ImagenRequest
): Promise<ImagenResponse> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GOOGLE_GEMINI_API_KEY not configured — returning placeholder");
    return {
      images: [
        {
          base64: "",
          mime_type: "image/png",
        },
      ],
    };
  }

  const response = await fetch(
    `${GEMINI_API_BASE}/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: request.prompt,
          },
        ],
        parameters: {
          sampleCount: request.number_of_images || 1,
          aspectRatio: request.aspect_ratio || "1:1",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Imagen API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const images = (
    data.predictions || []
  ).map((pred: { bytesBase64Encoded: string; mimeType?: string }) => ({
    base64: pred.bytesBase64Encoded || "",
    mime_type: pred.mimeType || "image/png",
  }));

  return { images };
}
