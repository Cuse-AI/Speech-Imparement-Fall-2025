import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Module } from '../types';

function Modules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await fetch('/api/modules');
        if (!response.ok) {
          throw new Error('Unable to load modules');
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

    loadModules();
  }, []);

  if (loading) {
    return (
      <main className="container">
        <p>Loading modules…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <p>There was a problem loading modules: {error}</p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Practice Modules</h1>
      <p>Explore practice modules focused on clarity, rhythm, and confident speech.</p>

      {modules.map((module) => (
        <article className="card" key={module.id}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <h2 style={{ margin: 0 }}>{module.title}</h2>
              <p className="level">{module.description}</p>
            </div>
            <span className="badge">{module.level}</span>
          </header>
          <ul className="exercises">
            {module.exercises.map((exercise) => (
              <li key={exercise.id} style={{ marginBottom: '0.75rem' }}>
                <strong>{exercise.text}</strong>
                <div className="level">Phonemes: {exercise.phonemes.join(', ')}</div>
                <div className="level">Level: {exercise.level}</div>
                <Link
                  className="button"
                  to={`/exercise/${exercise.id}`}
                  style={{ marginTop: '0.5rem', display: 'inline-block' }}
                >
                  Practice this exercise
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </main>
  );
}

export default Modules;
