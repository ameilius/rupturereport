import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-7xl font-black text-teal" aria-hidden="true">404</p>
      <h1 className="mt-4 text-3xl font-bold">Not on the admin roster</h1>
      <p className="mt-3 text-muted">That record or page doesn&apos;t exist. It may have been deleted.</p>
      <Link
        href="/admin"
        className="mt-8 inline-block rounded-lg bg-teal px-5 py-2.5 font-semibold text-bg hover:brightness-110"
      >
        Back to admin
      </Link>
    </main>
  );
}
