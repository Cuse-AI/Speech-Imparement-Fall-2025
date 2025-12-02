import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useRecorder, { blobToBase64 } from '../hooks/useRecorder';
import { Attempt, Exercise, Module } from '../types';

function ExercisePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attemptsByExercise, setAttemptsByExercise] = useState<Record<string, Attempt[]>>({});

  useEffect(() => {
    const storedAttempts = localStorage.getItem('exerciseAttempts');
    if (storedAttempts) {
      try {
        setAttemptsByExercise(JSON.parse(storedAttempts));
      } catch (err) {
        console.error('Failed to parse attempts from storage', err);
        setAttemptsByExercise({});
      }
    }
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/modules');
        if (!response.ok) {
          throw new Error('Unable to load exercise');
        }
        const data = await response.json();
        setModules(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const exercise: Exercise | undefined = useMemo(() => {
    return modules.flatMap((module) => module.exercises).find((item) => item.id === id);
  }, [id, modules]);

  const parentModule = useMemo(() => modules.find((module) => module.id === exercise?.moduleId), [exercise, modules]);

  const exerciseAttempts = useMemo(() => {
    if (!id) return [];
    return attemptsByExercise[id] ?? [];
  }, [attemptsByExercise, id]);

  const latestAttempt = exerciseAttempts[exerciseAttempts.length - 1];

  const playSynthesizedAudio = async () => {
    if (!latestAttempt?.ttsBase64) return;

    try {
      const audio = new Audio(`data:audio/mp3;base64,${latestAttempt.ttsBase64}`);
      await audio.play();
    } catch (err) {
      if (err instanceof Error) {
        setStatus(err.message);
      } else {
        setStatus('Unable to play pronunciation audio');
      }
    }
  };

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

  const submitAttempt = async () => {
    if (!exercise || !id) {
      setError('Exercise not found');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/onboarding');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const audioBlob = await stopRecording();
      const audioBase64 = await blobToBase64(audioBlob);

      const response = await fetch(`/api/exercise/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          targetText: exercise.text,
          audioBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to submit attempt');
      }

      const data = await response.json();
      const previousAttempts = attemptsByExercise[id] ?? [];
      const colorMap = exercise.phonemes.reduce<Record<string, string>>((map, phoneme) => {
        const match = (data.phonemes ?? []).find(
          (item: { ph?: string }) => item?.ph?.toLowerCase() === phoneme.toLowerCase()
        );
        const score = match?.score ?? data.overallScore ?? 0;
        if (score >= 80) {
          map[phoneme] = 'green';
        } else if (score >= 60) {
          map[phoneme] = 'blue';
        } else {
          map[phoneme] = 'red';
        }
        return map;
      }, {});

      const attemptRecord: Attempt = {
        id: `attempt-${Date.now()}`,
        exerciseId: id,
        userId,
        score: data.overallScore,
        accuracy: (data.overallScore ?? 0) / 100,
        feedback: data.feedback,
        ttsBase64: data.ttsBase64,
        createdAt: new Date().toISOString(),
        colorMap,
      };

      const updatedAttempts = {
        ...attemptsByExercise,
        [id]: [...previousAttempts, attemptRecord],
      };

      setAttemptsByExercise(updatedAttempts);
      localStorage.setItem('exerciseAttempts', JSON.stringify(updatedAttempts));

      setStatus(`Score ${data.overallScore.toFixed(1)} / 100. ${data.feedback ?? ''}`);
    } catch (err) {
      if (err instanceof Error) {
        setStatus(err.message);
      } else {
        setStatus('Unexpected error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <p>Loading exercise…</p>
      </main>
    );
  }

  if (error || !exercise) {
    return (
      <main className="container">
        <p>{error ?? 'Exercise not found.'}</p>
        <Link to="/modules" className="button">
          Back to modules
        </Link>
      </main>
    );
  }

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <p className="level" style={{ margin: 0 }}>
            {parentModule?.title}
          </p>
          <h1 style={{ margin: '0.25rem 0 0' }}>{exercise.text}</h1>
        </div>
        <Link to="/modules" className="button" style={{ whiteSpace: 'nowrap' }}>
          Back to modules
        </Link>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <p>Tap record, speak the phrase clearly, then submit your attempt for feedback.</p>

        <div className="chip-row" aria-label="Phoneme performance">
          {exercise.phonemes.map((phoneme) => (
            <span key={phoneme} className={`chip ${latestAttempt?.colorMap?.[phoneme] ?? 'neutral'}`}>
              {phoneme}
            </span>
          ))}
        </div>

        {latestAttempt?.feedback && <p className="level">{latestAttempt.feedback}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <button className="button" onClick={beginRecording} disabled={isRecording || submitting}>
            {isRecording ? 'Recording…' : 'Start recording'}
          </button>
          <button className="button" onClick={submitAttempt} disabled={!isRecording || submitting}>
            {submitting ? 'Submitting…' : 'Stop and submit'}
          </button>
          <button
            className="button"
            onClick={playSynthesizedAudio}
            disabled={!latestAttempt?.ttsBase64 || submitting}
            style={{ backgroundColor: '#22c55e', color: '#0f172a' }}
          >
            Listen
          </button>
        </div>

        {status && <p className="level">{status}</p>}
      </div>
    </main>
  );
}

export default ExercisePage;
