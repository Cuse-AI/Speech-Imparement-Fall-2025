import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRecorder, { blobToBase64 } from '../hooks/useRecorder';

const practiceWords = ['Bubble', 'Candle', 'River'];
const practiceSentence = 'She sells seashells by the seashore.';

function Test() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecorder();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/onboarding');
    }
  }, [navigate]);

  const beginRecording = async () => {
    setStatus(null);
    try {
      await startRecording();
    } catch (err) {
      if (err instanceof Error) {
        setStatus(err.message);
      } else {
        setStatus('Unable to start recording');
      }
    }
  };

  const submitPlacementAttempt = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/onboarding');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const audioBlob = await stopRecording();
      const audioBase64 = await blobToBase64(audioBlob);

      const response = await fetch('/api/placement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          audioBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Placement failed');
      }

      const data = await response.json();
      localStorage.setItem('placementLevel', String(data.placementLevel));
      setStatus(`Placement complete! Level ${data.placementLevel} assigned.`);
      navigate('/modules');
    } catch (err) {
      if (err instanceof Error) {
        setStatus(err.message);
      } else {
        setStatus('Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Placement Test</h1>
      <p>Read the following words and sentence aloud. We'll place you in the right module.</p>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Practice words</h2>
        <ul>
          {practiceWords.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>

        <h2>Practice sentence</h2>
        <p style={{ fontWeight: 600 }}>{practiceSentence}</p>

        <p className="level">Tap record, read the text aloud, then stop to submit your placement audio.</p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="button" onClick={beginRecording} disabled={isRecording || loading}>
            {isRecording ? 'Recording…' : 'Start recording'}
          </button>
          <button className="button" onClick={submitPlacementAttempt} disabled={!isRecording || loading}>
            {loading ? 'Submitting…' : 'Stop and submit'}
          </button>
        </div>

        {status && <p style={{ marginTop: '1rem' }}>{status}</p>}
      </div>
    </main>
  );
}

export default Test;
