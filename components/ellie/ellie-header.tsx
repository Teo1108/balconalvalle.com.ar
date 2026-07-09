import Link from 'next/link';

export default function EllieHeader() {
  return (
    <header className="w-full py-4 px-4">
      <div className="container mx-auto">
        <Link href="/" className="text-xl font-bold text-valle-dark">
          Balcon al Valle
        </Link>
      </div>
    </header>
  );
}
