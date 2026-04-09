import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">Pocket CFO</p>
        <h1>Page not found</h1>
        <p className="muted">
          The page or record could not be found in the current operator
          surface.
        </p>
        <div className="actions">
          <Link href="/" className="button primary">
            Back to operator home
          </Link>
        </div>
      </section>
    </main>
  );
}
