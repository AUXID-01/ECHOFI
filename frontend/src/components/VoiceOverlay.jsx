import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Copy,
  Trash2,
  Minimize2,
  AlertCircle,
} from "lucide-react";

const GATEWAY_ORIGIN = "http://localhost:9000"; // keep this as your API gateway origin

const VoiceOverlay = () => {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ripples, setRipples] = useState([]);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  /* ---------------- Ripple Animation Logic ---------------- */
  useEffect(() => {
    let interval;
    if (listening) {
      interval = setInterval(
        () => setRipples((prev) => [...prev, Date.now()]),
        500
      );
    }
    return () => clearInterval(interval);
  }, [listening]);

  useEffect(() => {
    const timer = setInterval(
      () => setRipples((prev) => prev.filter((t) => Date.now() - t < 1800)),
      100
    );
    return () => clearInterval(timer);
  }, []);

  /* ---------------- Recording Timing ---------------- */
  const MIN_DURATION = 400; // ms
  const MIN_SIZE_BYTES = 1000;
  const PAD_SILENCE_MS = 200;
  let recordStart = 0;

  /* ---------------- Start Listening ---------------- */
  const startListening = async () => {
    setError("");
    setResponse("");
    setTranscript("");
    recordStart = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
      setListening(true);
    } catch {
      setError("Microphone access denied.");
    }
  };

  /* ---------------- Stop & Fix Audio ---------------- */
  const stopListeningAndSend = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    const duration = Date.now() - recordStart;

    if (duration < MIN_DURATION) {
      await new Promise((r) => setTimeout(r, MIN_DURATION - duration));
    }

    recorder.onstop = async () => {
      let blob = new Blob(chunksRef.current, { type: "audio/webm" });

      if (blob.size < MIN_SIZE_BYTES) {
        try {
          blob = await padAudioWithSilence(blob, PAD_SILENCE_MS);
        } catch {
          setError("Audio capture failed — please try again.");
          return;
        }
      }

      await sendToBackend(blob);

      try {
        recorder.stream.getTracks().forEach((t) => t.stop());
      } catch {}
    };

    recorder.stop();
    setListening(false);
  };

  /* ---------------- Silence Padding ---------------- */
  const padAudioWithSilence = (blob, extraMs) =>
    new Promise((resolve, reject) => {
      const audioCtx = new AudioContext();
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const buffer = await audioCtx.decodeAudioData(reader.result);
          const paddedLength =
            buffer.length + audioCtx.sampleRate * (extraMs / 1000);

          const newBuffer = audioCtx.createBuffer(
            1,
            paddedLength,
            audioCtx.sampleRate
          );

          newBuffer.getChannelData(0).set(buffer.getChannelData(0), 0);

          const wav = audioBufferToWav(newBuffer);
          resolve(new Blob([wav], { type: "audio/wav" }));
        } catch (e) {
          reject(e);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

  /* ---------------- Convert to WAV ---------------- */
  const audioBufferToWav = (buffer) => {
    let numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      buffer2 = new ArrayBuffer(length),
      view = new DataView(buffer2),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0;

    const write = (str) => {
      for (i = 0; i < str.length; i++) view.setUint8(pos++, str.charCodeAt(i));
    };

    const writeUint16 = (d) => {
      view.setUint16(pos, d, true);
      pos += 2;
    };

    const writeUint32 = (d) => {
      view.setUint32(pos, d, true);
      pos += 4;
    };

    write("RIFF");
    writeUint32(length - 8);
    write("WAVE");
    write("fmt ");
    writeUint32(16);
    writeUint16(1);
    writeUint16(numOfChan);
    writeUint32(buffer.sampleRate);
    writeUint32(buffer.sampleRate * 2 * numOfChan);
    writeUint16(numOfChan * 2);
    writeUint16(16);
    write("data");
    writeUint32(length - pos - 4);

    for (i = 0; i < numOfChan; i++)
      channels.push(buffer.getChannelData(i));

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return buffer2;
  };

  /* ---------------- Backend Pipeline ---------------- */
  const sendToBackend = async (audioBlob) => {
  setProcessing(true);
  setError("");

  try {
    const form = new FormData();
    const filename = audioBlob.type && audioBlob.type.includes("wav")
      ? "input.wav"
      : "input.webm";
    form.append("audio", audioBlob, filename);

    const res = await fetch(`${GATEWAY_ORIGIN}/voice`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      let text = await res.text();
      try {
        const j = JSON.parse(text);
        throw new Error(JSON.stringify(j));
      } catch {
        throw new Error(text);
      }
    }

    const data = await res.json();
    console.log("Gateway Response:", data);

    const userText = data.user_text || "";
    const botText = data.bot_text || data.response || "";
    const intent = data.intent || "";

    setTranscript(userText);
    setResponse(botText);

    setHistory((prev) => [
      ...prev,
      ...(userText ? [{ type: "user", text: userText }] : []),
      ...(botText ? [{ type: "assistant", text: botText }] : []),
    ]);

    // -------------------------
    // 🎧 PLAY TTS FIRST
    // -------------------------
    if (data.audio_url) {
      let url = data.audio_url;
      if (!url.startsWith("http")) {
        url = `${GATEWAY_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
      }

      console.log("TTS URL:", url);

      await new Promise((resolve) => {
        try {
          const audio = new Audio(url);
          audioPlayerRef.current = audio;

          // resolve once playback finishes
          audio.onended = () => {
            console.log("TTS finished.");
            resolve();
          };

          audio.onerror = () => {
            console.warn("Audio failed to play.");
            resolve(); // still resolve to continue navigation
          };

          audio.play().catch((err) => {
            console.warn("Audio play error:", err);
            resolve();
          });
        } catch (err) {
          console.warn("Audio error:", err);
          resolve();
        }
      });
    }

    // -------------------------
    // 🧭 NAVIGATE AFTER TTS FINISHES
    // -------------------------
    if (intent) {
      handleVoiceIntent(intent, userText);
    }

  } catch (err) {
    console.error("sendToBackend error:", err);
    setError(`Voice pipeline failed: ${String(err)}`);
  }

  setProcessing(false);
};


  /* ---------------- Play Audio ---------------- */
  // Now returns a promise (audio.play()) so caller can await playback start
  const playAudioUrl = (url) => {
    return new Promise((resolve, reject) => {
      try {
        if (audioPlayerRef.current) {
          try {
            audioPlayerRef.current.pause();
          } catch {}
        }
        const audio = new Audio(url);
        audioPlayerRef.current = audio;
        // resolve when playback begins
        const p = audio.play();
        if (p && typeof p.then === "function") {
          p.then(() => resolve()).catch((e) => {
            console.error("Audio playback error:", e);
            setError("Audio playback failed.");
            reject(e);
          });
        } else {
          // older browsers: assume success
          resolve();
        }
      } catch (e) {
        console.error(e);
        setError("Could not play audio.");
        reject(e);
      }
    });
  };

  /* ---------------- Voice Navigation Handler ---------------- */
  const handleVoiceIntent = (intent, text) => {
    if (!intent) return;

    // Use history.pushState so we don't force a reload (which would stop audio)
    const navigateTo = (path) => {
      try {
        // only change URL if different
        if (window.location.pathname !== path) {
          window.history.pushState({}, "", path);
          // notify SPA routers (React Router listens to popstate / location changes)
          window.dispatchEvent(new PopStateEvent("popstate"));
          console.log("SPA navigation triggered to", path);
        }
      } catch (e) {
        console.warn("SPA navigation fallback to reload:", e);
        // last resort fallback: full reload (keeps previous behavior)
        window.location.href = path;
      }
    };

    switch (intent) {
      case "check_balance":
        console.log("Voice Nav → Balance Page");
        navigateTo("/dashboard");
        break;

      case "transfer_funds":
        console.log("Voice Nav → Transfer Page");
        navigateTo("/money-transfer");
        break;

      case "view_history":
        console.log("Voice Nav → Transaction History");
        navigateTo("/transactions");
        break;

      case "apply_loan":
        console.log("Voice Nav → Loan Application");
        navigateTo("/loans");
        break;

      default:
        console.log("Voice Intent Unknown:", intent, text);
    }
  };

  /* ---------------- Utility Buttons ---------------- */
  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setTranscript("");
    setResponse("");
    setHistory([]);
    setError("");
  };

  /* ---------------- Minimized UI ---------------- */
  if (!visible) return null;

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setMinimized(false)} className="relative group">
          {listening &&
            ripples.map((t) => (
              <div
                key={t}
                className="absolute inset-0 rounded-full bg-blue-500/30"
                style={{ animation: "ripple-mini 1.8s ease-out" }}
              />
            ))}
          <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl">
            {listening ? (
              <MicOff className="w-7 h-7 text-white animate-pulse" />
            ) : (
              <Mic className="w-7 h-7 text-white" />
            )}
          </div>
        </button>
      </div>
    );
  }

  /* ---------------- FULL OVERLAY UI ---------------- */
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px]">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
        {/* HEADER */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Voice Assistant</h3>
              <p className="text-blue-100 text-xs">
                {listening ? "Listening..." : processing ? "Processing..." : "Ready"}
              </p>
            </div>
          </div>
          <button onClick={() => setMinimized(true)}>
            <Minimize2 className="text-white w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="flex justify-center mb-6">
            <button
              onMouseDown={startListening}
              onMouseUp={stopListeningAndSend}
              onTouchStart={startListening}
              onTouchEnd={stopListeningAndSend}
              disabled={processing}
              className="w-28 h-28 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-xl"
            >
              {listening ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>
          </div>

          <p className="text-center text-sm mb-4 font-semibold">
            {listening ? "🎙 Listening... release to stop" : processing ? "⚙ Processing..." : "👋 Tap to start"}
          </p>

          {/* CHAT HISTORY */}
          {history.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto space-y-3 mb-4">
              {history.map((msg, i) => (
                <div key={i}>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm max-w-[80%] unselectable ${
                      msg.type === "user" ? "ml-auto bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
              <AlertCircle className="text-red-600 w-5 h-5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {transcript && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button onClick={copyTranscript} className="bg-white border py-3 rounded-xl flex gap-2 justify-center">
                <Copy /> {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={clearAll} className="bg-red-50 border border-red-200 py-3 rounded-xl flex gap-2 justify-center text-red-700">
                <Trash2 /> Clear
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-gray-100 border-t text-xs text-gray-500">English (India)</div>
      </div>
    </div>
  );
};

export default VoiceOverlay;
