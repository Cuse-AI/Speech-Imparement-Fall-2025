import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [serviceInfo, setServiceInfo] = useState<{ service: string; status: string } | null>(null);
  const [funTheme, setFunTheme] = useState(false);

  useEffect(() => {
    const checkService = async () => {
      try {
        const response = await fetch('/api/modules');
        if (response.ok) {
          setServiceInfo({
            service: 'Language Confidence API',
            status: '✅ Active',
          });
        }
      } catch (err) {
        setServiceInfo({
          service: 'Backend',
          status: '❌ Offline',
        });
      }
    };

    checkService();
  }, []);

  return (
    <main className={`container ${funTheme ? 'theme-fun' : ''}`}>
      {serviceInfo && (
        <div style={{
          background: serviceInfo.status.includes('✅') ? '#d1fae5' : '#fee2e2',
          border: serviceInfo.status.includes('✅') ? '2px solid #10b981' : '2px solid #ef4444',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          fontWeight: 'bold',
        }}>
          🔌 Using: <strong>{serviceInfo.service}</strong> {serviceInfo.status}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>🎤 Clario</h1>
        <button className="button" onClick={() => setFunTheme((v) => !v)}>
          {funTheme ? 'Switch to Calm Theme' : 'Switch to Fun Theme'}
        </button>
      </div>
      <p style={{ fontWeight: 600, color: '#1f2937' }}>
        Practice your words, get friendly feedback, and become a speech superstar!
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link className="button" to="/onboarding">
          Begin onboarding
        </Link>
        <Link className="button" to="/modules" style={{ background: '#f59e0b', color: '#7c2d12' }}>
          View modules
        </Link>
        <Link className="button" to="/resources" style={{ background: '#a78bfa', color: '#3b0764' }}>
          Resources
        </Link>
      </div>

      <footer style={{ marginTop: '2rem', opacity: 0.85 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            aria-hidden
            style={{ width: 36, height: 36, borderRadius: 12, background: '#fde68a', border: '2px solid #f59e0b' }}
          />
          <div>
            <div style={{ fontWeight: 800 }}>Clario</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Build speaking confidence with friendly, real‑time feedback</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Team Vocaltone</div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default App;
