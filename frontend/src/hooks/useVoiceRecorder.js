// src/hooks/useVoiceRecorder.js
import { useState, useRef } from "react";

/**
 * useVoiceRecorder
 * - startRecording() -> starts MediaRecorder
 * - stopRecording()  -> stops and resolves blob
 * - isRecording boolean
 * - lastBlob - last recorded Blob
 */
export default function useVoiceRecorder({ mimeType = "audio/webm" } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastBlob, setLastBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone not supported");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunksRef.current = [];

    const options = { mimeType };
    const recorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setLastBlob(blob);
      // stop all tracks
      stream.getTracks().forEach((t) => t.stop());
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return null;
    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType });
        setLastBlob(blob);
        setIsRecording(false);
        // stop tracks if still active
        try {
          if (recorder.stream) recorder.stream.getTracks().forEach((t) => t.stop());
        } catch {}
        resolve(blob);
      };
      recorder.stop();
    });
  };

  const cancelRecording = () => {
    try {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {}
    setIsRecording(false);
    chunksRef.current = [];
  };

  return {
    isRecording,
    lastBlob,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
