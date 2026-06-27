"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Square,
} from "lucide-react";
import type { AnamClient } from "@anam-ai/js-sdk";
import type { MicVAD } from "@ricky0123/vad-web";
import {
  hasArabic,
  sampleQuestions,
  type AgentResult,
  type Research,
} from "@/lib/research";
import { ResearchPanel } from "@/components/hakim/ResearchPanel";

type Status = "idle" | "connecting" | "live" | "error";
type ChatTurn = { role: "user" | "assistant"; content: string };

// 16 kHz mono Float32 -> 16-bit PCM WAV blob for OpenAI transcription.
function floatToWav(samples: Float32Array, sampleRate = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}

export default function HakimPage() {
  const clientRef = useRef<AnamClient | null>(null);
  const vadRef = useRef<MicVAD | null>(null);
  const busyRef = useRef(false);
  const historyRef = useRef<ChatTurn[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [statusNote, setStatusNote] = useState<string>("");
  const [research, setResearch] = useState<Research | null>(null);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [input, setInput] = useState("");
  const [lastUserText, setLastUserText] = useState<string>("");
  const [avatarFallback, setAvatarFallback] = useState(false);

  const isLive = status === "live";

  const safeInterrupt = useCallback(() => {
    try {
      clientRef.current?.interruptPersona();
    } catch {
      /* no-op if nothing is playing */
    }
    setSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    const client = clientRef.current;
    if (!client || !text) return;
    setSpeaking(true);
    try {
      await client.talk(text);
    } catch {
      /* ignore */
    }
  }, []);

  // Single path for producing + speaking an answer (typed, clicked, or spoken).
  const generateAnswer = useCallback(
    async (userText: string) => {
      const client = clientRef.current;
      const text = userText.trim();
      if (!client || !text || busyRef.current) return;

      busyRef.current = true;
      setThinking(true);
      setLastUserText(text);
      safeInterrupt();
      historyRef.current.push({ role: "user", content: text });

      const ar = hasArabic(text);
      try {
        // Phase 1 (fast): does this turn actually need market research?
        const planRes = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyRef.current }),
        });
        const plan = await planRes.json();

        if (planRes.ok && plan.mode === "answer" && plan.spoken_text) {
          // Small talk / no research: reply instantly, no filler.
          historyRef.current.push({ role: "assistant", content: plan.spoken_text });
          await speak(plan.spoken_text);
          return;
        }

        // Phase 2 (slow): research is warranted. Now the filler is natural.
        setSpeaking(true);
        client
          .talk(
            ar
              ? "لحظة من فضلك، أبحث في بيانات السوق الإماراتي."
              : "Good question, let me look into the UAE market data for you."
          )
          .catch(() => {});

        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyRef.current }),
        });
        const data: AgentResult & { error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Agent request failed");

        if (data.research) setResearch(data.research);
        if (data.spoken_text) {
          historyRef.current.push({ role: "assistant", content: data.spoken_text });
          await speak(data.spoken_text);
        }
      } catch {
        await speak(
          ar
            ? "عذرًا، واجهت مشكلة في جلب البيانات. حاول مرة أخرى."
            : "Sorry, I ran into a problem fetching the data. Please try again."
        );
      } finally {
        busyRef.current = false;
        setThinking(false);
      }
    },
    [safeInterrupt, speak]
  );

  // Stable ref so VAD callbacks always reach the latest generateAnswer.
  const generateAnswerRef = useRef(generateAnswer);
  useEffect(() => {
    generateAnswerRef.current = generateAnswer;
  }, [generateAnswer]);

  const ask = useCallback(
    (text: string) => {
      if (!isLive) return;
      setInput("");
      void generateAnswer(text);
    },
    [isLive, generateAnswer]
  );

  // A detected utterance -> OpenAI transcription -> answer.
  const handleUtterance = useCallback(async (audio: Float32Array) => {
    if (busyRef.current) return; // already researching; ignore overlap
    setTranscribing(true);
    try {
      const form = new FormData();
      form.append("file", floatToWav(audio), "speech.wav");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = await res.json();
      const text = (data.text || "").trim();
      setTranscribing(false);
      if (text) void generateAnswerRef.current(text);
    } catch {
      setTranscribing(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (vadRef.current) {
      await vadRef.current.start();
      setListening(true);
      return;
    }
    try {
      const { MicVAD } = await import("@ricky0123/vad-web");
      const vad = await MicVAD.new({
        model: "v5",
        baseAssetPath: "/vad/",
        onnxWASMBasePath: "/vad/",
        // Tuned so natural pauses don't end a turn early and the avatar's own
        // voice (after echo cancellation) doesn't trigger false turns.
        positiveSpeechThreshold: 0.6,
        negativeSpeechThreshold: 0.4,
        redemptionMs: 700,
        minSpeechMs: 250,
        preSpeechPadMs: 200,
        getStream: () =>
          navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }),
        onSpeechStart: () => {
          setUserSpeaking(true);
          safeInterrupt(); // barge-in: stop the avatar the moment the user talks
        },
        onSpeechEnd: (audio) => {
          setUserSpeaking(false);
          void handleUtterance(audio);
        },
        onVADMisfire: () => setUserSpeaking(false),
      });
      vadRef.current = vad;
      vad.start();
      setListening(true);
    } catch {
      setStatusNote("Microphone access is needed for live conversation.");
    }
  }, [safeInterrupt, handleUtterance]);

  const stopListening = useCallback(async () => {
    setUserSpeaking(false);
    try {
      await vadRef.current?.pause();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) void stopListening();
    else void startListening();
  }, [listening, startListening, stopListening]);

  const startSession = useCallback(async () => {
    try {
      setStatus("connecting");
      setStatusNote("Connecting to Hakim...");

      const res = await fetch("/api/anam/session-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.sessionToken) {
        throw new Error(data.error || "Could not create a session");
      }
      setAvatarFallback(Boolean(data.avatarIsFallback));

      const { createClient, AnamEvent } = await import("@anam-ai/js-sdk");
      const client = createClient(data.sessionToken);
      clientRef.current = client;

      client.addListener(AnamEvent.SESSION_READY, () => {
        setStatus("live");
        setStatusNote("");
        // We run our own (OpenAI) speech-to-text via VAD, so silence Anam's
        // built-in mic transcription to avoid double / mis-detected turns.
        try {
          client.muteInputAudio();
        } catch {
          /* ignore */
        }
        void speak(
          "Hello, I'm Hakim. Just start talking, in Arabic or English, and tell me about a business idea. I'll research the UAE market and show you the data and the sources."
        );
        void startListening();
      });
      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        setStatus("idle");
        setSpeaking(false);
        clientRef.current = null;
      });
      client.addListener(AnamEvent.TALK_STREAM_INTERRUPTED, () => {
        setSpeaking(false);
      });

      await client.streamToVideoElement("hakim-video");
    } catch (err) {
      setStatus("error");
      setStatusNote(err instanceof Error ? err.message : "Failed to start session");
    }
  }, [speak, startListening]);

  useEffect(() => {
    return () => {
      vadRef.current?.destroy().catch(() => {});
      vadRef.current = null;
      clientRef.current?.stopStreaming().catch(() => {});
      clientRef.current = null;
    };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ink text-white">
      {/* Soft spotlight behind the avatar so the letterboxed area feels intentional */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_42%,rgba(232,185,106,0.10),transparent_70%)]"
        aria-hidden
      />
      <video
        id="hakim-video"
        autoPlay
        playsInline
        className="absolute inset-0 mx-auto h-full w-full max-w-5xl object-contain object-center"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/90 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink via-ink/70 to-transparent"
        aria-hidden
      />

      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/60 px-3 py-1.5 text-sm text-white/80 backdrop-blur transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-line bg-ink/60 px-3 py-1.5 backdrop-blur">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gold/15 text-gold">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="font-display text-sm font-bold">
            Hakim<span className="text-gold"> AI</span>
          </span>
          <StatusDot
            status={status}
            listening={listening}
            userSpeaking={userSpeaking}
            transcribing={transcribing}
            thinking={thinking}
            speaking={speaking}
          />
        </div>
      </header>

      {/* Left: sample questions */}
      <aside className="absolute left-5 top-20 z-20 hidden w-72 lg:block">
        <div className="rounded-2xl border border-line bg-ink/55 p-4 backdrop-blur-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">Try asking</p>
          <div className="flex flex-col gap-2">
            {sampleQuestions.map((q) => {
              const rtl = q.lang === "ar";
              return (
                <button
                  key={q.id}
                  onClick={() => ask(q.text)}
                  disabled={!isLive || thinking}
                  dir={rtl ? "rtl" : "ltr"}
                  className={`rounded-xl border border-line bg-card/50 px-3 py-2.5 text-left text-sm leading-snug text-white/75 transition-colors hover:border-gold/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 ${
                    rtl ? "font-arabic text-right" : ""
                  }`}
                >
                  {q.text}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right: research output */}
      <aside className="absolute right-5 top-20 z-20 hidden w-[26rem] xl:block">
        <div className="h-[calc(100vh-12rem)] rounded-2xl border border-line bg-ink/55 p-5 backdrop-blur-xl">
          <ResearchPanel research={research} loading={thinking} />
        </div>
      </aside>

      {/* Stop speaking (interrupt) */}
      {speaking && isLive && (
        <button
          onClick={safeInterrupt}
          className="absolute bottom-28 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-ink/80 px-4 py-2 text-sm text-white/85 backdrop-blur transition-colors hover:border-gold/50 hover:text-white"
        >
          <Square className="h-3.5 w-3.5 fill-current" /> Stop
        </button>
      )}

      {/* Bottom: input bar */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-6">
        <div className="mx-auto w-full max-w-2xl">
          {isLive && (
            <p
              dir={lastUserText && hasArabic(lastUserText) ? "rtl" : "ltr"}
              className={`mb-2 truncate text-center text-xs text-white/50 ${
                lastUserText && hasArabic(lastUserText) ? "font-arabic" : ""
              }`}
            >
              {userSpeaking
                ? "Listening to you..."
                : transcribing
                  ? "Transcribing..."
                  : lastUserText
                    ? `You asked: ${lastUserText}`
                    : listening
                      ? "Mic is live, just start talking"
                      : "Mic is muted, type or unmute to talk"}
            </p>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 rounded-full border border-line bg-ink/80 p-2 backdrop-blur-xl"
          >
            <button
              type="button"
              onClick={toggleListening}
              disabled={!isLive}
              title={listening ? "Mute microphone" : "Unmute microphone"}
              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-40 ${
                listening
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                  : "border-line text-white/60 hover:text-white"
              }`}
            >
              {listening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              {userSpeaking && (
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-emerald-400/60" />
              )}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isLive ? "Speak freely, or type a question here..." : "Start the session to begin"
              }
              disabled={!isLive || thinking}
              className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isLive || thinking || !input.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-ink transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              {thinking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>

      {/* Start / status overlay */}
      {!isLive && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div className="mx-5 max-w-md rounded-3xl border border-line bg-card/80 p-8 text-center backdrop-blur-xl">
            <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold ring-1 ring-gold/30">
              <Sparkles className="h-7 w-7" />
            </span>
            <h1 className="font-display text-2xl font-bold">Talk to Hakim AI</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Hakim is a bilingual market-research advisor. Once connected, just start talking in
              Arabic or English, he listens live, researches real UAE data, and shows the chart and
              sources. Headphones are recommended for the best live experience.
            </p>

            {status === "error" && (
              <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {statusNote}
              </p>
            )}

            <button
              onClick={startSession}
              disabled={status === "connecting"}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {status === "connecting" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> {statusNote || "Connecting..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" /> Start session
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {avatarFallback && isLive && (
        <p className="absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-full border border-line bg-ink/70 px-3 py-1 text-[11px] text-white/45 backdrop-blur">
          Demo avatar (custom face needs an enterprise plan)
        </p>
      )}
    </main>
  );
}

function StatusDot({
  status,
  listening,
  userSpeaking,
  transcribing,
  thinking,
  speaking,
}: {
  status: Status;
  listening: boolean;
  userSpeaking: boolean;
  transcribing: boolean;
  thinking: boolean;
  speaking: boolean;
}) {
  let color = "bg-white/40";
  let label = "Offline";
  if (status === "connecting") {
    color = "bg-amber-400 animate-pulse";
    label = "Connecting";
  } else if (status === "error") {
    color = "bg-red-400";
    label = "Error";
  } else if (status === "live") {
    if (userSpeaking) {
      color = "bg-emerald-400 animate-pulse";
      label = "Listening";
    } else if (transcribing) {
      color = "bg-sky-400 animate-pulse";
      label = "Transcribing";
    } else if (thinking) {
      color = "bg-gold animate-pulse";
      label = "Researching";
    } else if (speaking) {
      color = "bg-violet-400 animate-pulse";
      label = "Speaking";
    } else if (listening) {
      color = "bg-emerald-400";
      label = "Live";
    } else {
      color = "bg-white/40";
      label = "Muted";
    }
  }
  return (
    <span className="ml-1 flex items-center gap-1.5 border-l border-line pl-2 text-xs text-white/60">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
    </span>
  );
}
