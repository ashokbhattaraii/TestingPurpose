import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      {/* Background Orbs for Premium Look */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[80px]" />

      <div className="relative mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-neutral-100/50 p-1 shadow-inner ring-1 ring-neutral-200 backdrop-blur-sm dark:bg-neutral-900/50 dark:ring-neutral-800 animate-in fade-in zoom-in duration-700">
        <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white text-primary shadow-sm dark:bg-neutral-950">
          <FileQuestion className="h-12 w-12" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg animate-bounce">
          ?
        </div>
      </div>

      <div className="space-y-4 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <h1 className="text-6xl font-black tracking-tight text-foreground sm:text-7xl">
          404
        </h1>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">
          Oops! Page Not Found
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          The page you are looking for seems to have vanished into the digital void. 
          Don't worry, even the best explorers get lost sometimes.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-12 border-neutral-200 bg-white shadow-sm hover:translate-x-[-2px] hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 px-8"
        >
          <Link href="javascript:history.back()" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          className="h-12 bg-primary px-8 shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-primary/30"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mt-20 flex items-center gap-2 text-xs font-medium text-muted-foreground/60 animate-in fade-in duration-1000 delay-500">
        <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <p>© {new Date().getFullYear()} Rumsan WorkOps</p>
        <div className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>
    </div>
  );
}
