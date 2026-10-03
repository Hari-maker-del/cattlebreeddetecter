import { createFileRoute } from "@tanstack/react-router";

const allowedLanguages = new Set([
  "en-IN", "hi-IN", "ta-IN", "te-IN", "kn-IN", "ml-IN", "mr-IN", "bn-IN", "gu-IN",
  "pa-IN", "or-IN", "as-IN", "ur-IN", "ne-NP", "sa-IN", "sd-IN", "sat-IN", "mni-IN",
]);

export const Route = createFileRoute("/api/copilot-voice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json() as { text?: unknown; language?: unknown };
          const text = typeof body.text === "string" ? body.text.trim() : "";
          const language = typeof body.language === "string" ? body.language : "";

          if (!text || text.length > 5000) {
            return Response.json({ error: "Text must contain 1–5000 characters." }, { status: 400 });
          }
          if (!allowedLanguages.has(language)) {
            return Response.json({ error: "Unsupported voice language." }, { status: 400 });
          }

          const providerUrl = process.env.COPILOT_TTS_API_URL?.trim();
          const providerKey = process.env.COPILOT_TTS_API_KEY?.trim();
          if (!providerUrl || !providerKey) {
            return Response.json({ error: "AI voice provider is not configured." }, { status: 503 });
          }

          const providerResponse = await fetch(providerUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${providerKey}`,
              "Content-Type": "application/json",
              Accept: "audio/mpeg,audio/wav,audio/*",
            },
            body: JSON.stringify({ text, language }),
          });

          if (!providerResponse.ok) {
            return Response.json({ error: "Voice provider request failed." }, { status: 502 });
          }

          const contentType = providerResponse.headers.get("content-type") || "audio/mpeg";
          if (!contentType.startsWith("audio/")) {
            return Response.json({ error: "Voice provider returned a non-audio response." }, { status: 502 });
          }

          return new Response(await providerResponse.arrayBuffer(), {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "no-store",
              "X-Copilot-Voice": "remote",
            },
          });
        } catch {
          return Response.json({ error: "Unable to generate voice audio." }, { status: 500 });
        }
      },
    },
  },
});
