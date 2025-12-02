import React from 'react';

function Resources() {
  const pdfPath = '/assets/STUTTER.pdf';

  return (
    <main className="container">
      <h1>Resources</h1>
      <p>Helpful practice materials and reference PDFs.</p>

      <section className="card">
        <h2>Stuttering Practice (PDF)</h2>
        <p>
          Contains short phrases and easy-to-follow strategies for practicing
          fluent speech. The app includes a few simplified exercises drawn from
          the PDF so you can start practicing immediately.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a className="button" href={pdfPath} target="_blank" rel="noreferrer">
            Open PDF
          </a>
          <a className="button" href={pdfPath} download>
            Download PDF
          </a>
        </div>

        <p style={{ marginTop: '1rem', color: '#6b7280' }}>
          Note: the PDF is served from <code>/assets/STUTTER.pdf</code>. Place the
          file at <code>frontend/public/assets/STUTTER.pdf</code> to override the
          included placeholder.
        </p>

        <div style={{ marginTop: '1rem' }}>
          <iframe
            title="Stuttering Practice PDF"
            src={pdfPath}
            style={{ width: '100%', height: '600px', border: '1px solid #e5e7eb' }}
          />
        </div>
      </section>
    </main>
  );
}

export default Resources;
