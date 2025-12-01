import { useRef, useState } from 'react';

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const [, base64] = result.split(',');
        resolve(base64 ?? '');
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error('Unable to read audio blob'));
    };

    reader.readAsDataURL(blob);
  });
}

function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (isRecording) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () =>
    new Promise<Blob>((resolve, reject) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || !isRecording) {
        reject(new Error('No active recording to stop'));
        return;
      }

      const handleStop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        recorder.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        resolve(blob);
      };

      const handleError = (event: MediaRecorderErrorEvent) => {
        setIsRecording(false);
        reject(event.error ?? new Error('Recording failed'));
      };

      recorder.addEventListener('stop', handleStop, { once: true });
      recorder.addEventListener('error', handleError, { once: true });
      recorder.stop();
    });

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}

export default useRecorder;
