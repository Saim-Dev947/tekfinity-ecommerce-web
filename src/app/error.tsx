"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <h1 className="font-display text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={reset} className="btn-teal mt-8 px-8">Try Again</button>
    </div>
  );
}
