import { Link } from 'react-router-dom';

function App() {
  return (
    <main className="container">
      <h1>Speech Practice</h1>
      <p>Welcome! Start with onboarding so we can tailor your placement.</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link className="button" to="/onboarding">
          Begin onboarding
        </Link>
        <Link className="button" to="/modules" style={{ background: '#0ea5e9' }}>
          View modules
        </Link>
      </div>
    </main>
  );
}

export default App;
