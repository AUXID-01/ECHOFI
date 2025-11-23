// src/hooks/useVoiceAssistant.js
import { useState, useRef } from "react";

/**
 * useVoiceAssistant
 * - sendAudio(blob, sessionId) -> calls /voice and returns parsed response
 * - handles both audio_base64 and audio_url results and auto-plays
 */
export default function useVoiceAssistant({ gatewayUrl = "http://localhost:8000" } = {}) {
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const audioRef = useRef(null);

  const sendAudio = async (audioBlob, opts = {}) => {
    // opts: { session_id }
    setLoading(true);
    try {
      const fd = new FormData();
      // choose filename extension that backend accepts (.webm is allowed)
      fd.append("audio", audioBlob, "input.webm");

      const resp = await fetch(`${gatewayUrl}/voice`, {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Voice pipeline error: ${resp.status} ${errText}`);
      }

      const data = await resp.json();
      setLastResponse(data);

      // play audio if present
      if (data.audio_base64) {
        // decode base64 and play
        const binary = atob(data.audio_base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes.buffer], { type: "audio/wav" }); // type guessed
        const url = URL.createObjectURL(blob);
        playUrl(url, true);
      } else if (data.audio_url) {
        // audio_url might be relative path; try absolute if needed
        const url =
          data.audio_url.startsWith("http") ? data.audio_url : `${gatewayUrl}${data.audio_url}`;
        playUrl(url, false);
      }

      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const playUrl = (url, revokeAfter = false) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => {
        if (revokeAfter) URL.revokeObjectURL(url);
      };
      a.play().catch((e) => console.warn("Playback failed", e));
    } catch (e) {
      console.warn("playUrl error", e);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  };

  return {
    loading,
    lastResponse,
    sendAudio,
    playUrl,
    stopPlayback,
  };
}
