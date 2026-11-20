import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-bold text-teal">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary px-6">Back to Home</Link>
        <Link href="/shop" className="btn-outline px-6">Browse Products</Link>
      </div>
    </div>
  );
}
