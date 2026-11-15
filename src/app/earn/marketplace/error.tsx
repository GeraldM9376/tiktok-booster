"use client";

export default function MarketplaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold text-red-500">Marketplace Error</h2>
      <p className="text-muted-foreground">The page crashed while loading.</p>
      <pre className="max-w-2xl overflow-auto rounded-lg bg-secondary p-4 text-xs">
        {error.message}
      </pre>
      <button
        onClick={() => reset()}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}