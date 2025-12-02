import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function App() {
  const [serviceInfo, setServiceInfo] = useState<{ service: string; status: string } | null>(null);

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
    <main className="container">
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
      <h1>Speech Practice</h1>
      <p>Welcome! Start with onboarding so we can tailor your placement.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link className="button" to="/onboarding">
          Begin onboarding
        </Link>
        <Link className="button" to="/modules" style={{ background: '#0ea5e9' }}>
          View modules
        </Link>
        <Link className="button" to="/resources" style={{ background: '#34d399' }}>
          Resources
        </Link>
      </div>
    </main>
  );
}

export default App;
