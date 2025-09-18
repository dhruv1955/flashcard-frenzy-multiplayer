"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to monitoring here
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md w-full border border-white/10 rounded-lg p-6 bg-white/5">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-400 mb-4" aria-live="polite">{error.message}</p>
            <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 text-white rounded" aria-label="Try again">
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}


