"use client";

import { useRouter } from "next/navigation";

interface NotFoundPageProps {
  title?: string;
  description?: string;
  backLabel?: string;
  backHref?: string;
}
//page not found
export function NotFoundPage({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  backLabel = "Go Back",
  backHref,
}: NotFoundPageProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 px-6 text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative">
          <span className="text-[10rem] font-black leading-none tracking-tighter text-primary/10 select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[10rem] font-black leading-none tracking-tighter text-transparent bg-gradient-to-br from-primary via-primary/70 to-primary/40 bg-clip-text select-none animate-pulse">
            404
          </span>
        </div>

        {/* Message */}
        <div className="flex flex-col items-center gap-2 -mt-6">
          <h1 className="text-2xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            {description}
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          {backLabel}
        </button>

        {/* Home link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
