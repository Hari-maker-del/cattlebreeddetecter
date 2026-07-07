import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  imageDataUrl: z.string().min(32),
});

export type ClassifyResult =
  | {
      status: "success";
      animal_type: "Cow" | "Buffalo";
      breed: string;
      confidence: number; // 0..100
      explanation: string;
      features: string[];
      quality: {
        blurry: boolean;
        too_dark: boolean;
        low_resolution: boolean;
        multiple_animals: boolean;
        side_view: boolean;
        warnings: string[];
      };
    }
  | {
      status: "invalid";
      reason: string;
      details?: string;
    }
  | {
      status: "error";
      message: string;
    };

const SYSTEM_PROMPT = `You are an expert veterinary AI specializing in identifying cattle (cows) and buffaloes and their breeds from images.

Your job:
1. First, VALIDATE the image:
   - It must contain a live cow or buffalo (bovine).
   - Reject humans, other animals (dogs, cats, horses, goats, sheep, etc.), objects, cartoons, or non-animal images.
   - Reject if there are multiple distinct animals in frame.
   - Note quality issues: blurry, too dark, too small/low resolution, only a side/partial view.

2. If valid, classify:
   - animal_type: "Cow" or "Buffalo"
   - breed: best-guess specific breed name (e.g., "Holstein Friesian", "Jersey", "Gir", "Sahiwal", "Murrah", "Nili-Ravi", "Jaffarabadi", "Surti"). If uncertain, still give the most likely breed.
   - confidence: 0-100 realistic confidence.
   - explanation: 1-2 sentences on WHY (visible features).
   - features: array of 3-5 distinguishing visual features you observed (e.g., "prominent hump", "curved horns", "black-and-white coat").

Respond ONLY as strict JSON matching one of these shapes, no prose, no markdown fences:

If valid:
{"status":"success","animal_type":"Cow|Buffalo","breed":"...","confidence":92.4,"explanation":"...","features":["...","..."],"quality":{"blurry":false,"too_dark":false,"low_resolution":false,"multiple_animals":false,"side_view":false,"warnings":["..."]}}

If not a cow/buffalo or unusable:
{"status":"invalid","reason":"short reason like 'Not a cow or buffalo' or 'Multiple animals detected' or 'Image too blurry'","details":"one-sentence explanation"}`;

export const classifyImage = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<ClassifyResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { status: "error", message: "AI is not configured." };

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": key,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "Analyze this image and respond with JSON only." },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          temperature: 0.2,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return { status: "error", message: "Rate limit reached. Please retry shortly." };
        if (res.status === 402) return { status: "error", message: "AI credits exhausted. Add credits to continue." };
        const t = await res.text();
        return { status: "error", message: `AI error: ${t.slice(0, 160)}` };
      }

      const json = await res.json();
      const content: string = json?.choices?.[0]?.message?.content ?? "";
      const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}$/) ?? cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : cleaned);
      return parsed as ClassifyResult;
    } catch (e) {
      return { status: "error", message: e instanceof Error ? e.message : "Unknown error" };
    }
  });
