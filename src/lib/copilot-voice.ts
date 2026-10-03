export type CopilotVoiceLanguage =
  | "en-IN" | "hi-IN" | "ta-IN" | "te-IN" | "kn-IN" | "ml-IN" | "mr-IN" | "bn-IN" | "gu-IN"
  | "pa-IN" | "or-IN" | "as-IN" | "ur-IN" | "ne-NP" | "sa-IN" | "sd-IN" | "sat-IN" | "mni-IN";

export type VoiceSynthesisResult = {
  usedProvider: "remote" | "browser";
  fallback: boolean;
  voiceName?: string;
};

const configuredVoiceUrl = (import.meta.env.VITE_COPILOT_VOICE_URL as string | undefined)?.trim();
const REMOTE_VOICE_URL = configuredVoiceUrl || "/api/copilot-voice";

function browserVoice(locale: string, fallbackLocale?: string): SpeechSynthesisVoice | undefined {
  if (!("speechSynthesis" in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((voice) => voice.lang.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;
  const base = locale.split("-")[0].toLowerCase();
  const sameLanguage = voices.find((voice) => voice.lang.toLowerCase().startsWith(`${base}-`));
  if (sameLanguage) return sameLanguage;
  if (!fallbackLocale) return undefined;
  const fallbackBase = fallbackLocale.split("-")[0].toLowerCase();
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(`${fallbackBase}-`));
}

async function remoteSynthesis(text: string, language: string): Promise<ArrayBuffer | null> {
  if (!REMOTE_VOICE_URL) return null;
  try {
    const response = await fetch(REMOTE_VOICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("audio/")) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

export async function speakCopilot(text: string, language: CopilotVoiceLanguage, fallbackLanguage = "hi-IN"): Promise<VoiceSynthesisResult> {
  if (!text.trim()) return { usedProvider: "browser", fallback: false };

  const remoteAudio = await remoteSynthesis(text, language);
  if (remoteAudio && typeof Audio !== "undefined") {
    const blob = new Blob([remoteAudio]);
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await new Promise<void>((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
      void audio.play().catch(() => resolve());
    });
    return { usedProvider: "remote", fallback: false };
  }

  if (!("speechSynthesis" in window)) return { usedProvider: "browser", fallback: true };
  window.speechSynthesis.cancel();
  const voice = browserVoice(language, fallbackLanguage);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? language;
  if (voice) utterance.voice = voice;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  return { usedProvider: "browser", fallback: !voice, voiceName: voice?.name };
}

export function stopCopilotVoice() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function getCopilotVoiceMode() {
  return configuredVoiceUrl ? "custom-ai-provider-with-browser-fallback" : "secure-server-ai-provider-with-browser-fallback";
}
