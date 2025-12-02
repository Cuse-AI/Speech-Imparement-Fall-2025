import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OnboardingPayload {
  age: number;
  readingLevel: string;
  difficultyArea: string;
}

function Onboarding() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OnboardingPayload>({
    age: 10,
    readingLevel: 'beginner',
    difficultyArea: 'articulation',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Unable to complete onboarding');
      }

      const data = await response.json();
      localStorage.setItem('userId', data.userId);
      navigate('/test');
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

  return (
    <main className="container">
      <h1>Welcome to Speech Practice</h1>
      <p>Tell us a bit about you so we can tailor your practice plan.</p>

      <section style={{ marginBottom: '1rem' }}>
        <strong>Quick reference:</strong> Short practice tips and phrases are available in the STUTTER PDF.
        <div style={{ marginTop: '0.5rem' }}>
          <a className="button" href="/assets/STUTTER.pdf" target="_blank" rel="noreferrer">
            Open practice PDF
          </a>
        </div>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ display: 'block', fontWeight: 600 }}>Age</span>
          <input
            type="number"
            min={4}
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ display: 'block', fontWeight: 600 }}>Reading level</span>
          <select
            value={formData.readingLevel}
            onChange={(e) => setFormData({ ...formData, readingLevel: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: '1rem' }}>
          <span style={{ display: 'block', fontWeight: 600 }}>What do you find difficult?</span>
          <select
            value={formData.difficultyArea}
            onChange={(e) => setFormData({ ...formData, difficultyArea: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          >
            <option value="articulation">Articulation</option>
            <option value="rhythm">Rhythm and pacing</option>
            <option value="volume">Volume control</option>
            <option value="confidence">Confidence</option>
          </select>
        </label>

        {error && (
          <p className="level" style={{ color: '#b91c1c' }}>
            {error}
          </p>
        )}

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Continue to placement test'}
        </button>
      </form>
    </main>
  );
}

export default Onboarding;
