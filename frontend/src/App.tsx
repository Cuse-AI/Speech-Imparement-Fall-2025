import { Link } from 'react-router-dom';

function App() {
  return (
    <main className="container">
      <h1>Speech Practice</h1>
      <p>Welcome! Explore practice content designed for clarity and rhythm.</p>
      <Link className="button" to="/modules">
        View Modules
      </Link>
    </main>
  );
}

export default App;
