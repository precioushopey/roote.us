import { Link } from 'react-router';

export function Landing() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-8 px-6 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
        Personalized Hair Growth System
      </p>
      <h1 className="text-5xl sm:text-6xl" style={{ fontFamily: "'Libre Franklin', serif", letterSpacing: '0.06em' }}>
        ROOTÉ
      </h1>
      <Link
        to="/diagnosis"
        className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-8 py-4 text-sm tracking-wide"
      >
        Start Free Diagnosis · אבחון שיער חינם
      </Link>
    </main>
  );
}
