"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileQuestion, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotFoundComponentProps {
  title?: string;
  description?: string;
  backLink?: string;
  backText?: string;
  icon?: LucideIcon;
  className?: string;
}

export function NotFoundComponent({
  title = "Not Found",
  description = "The resource you are looking for doesn't exist or has been moved.",
  backLink,
  backText = "Go Back",
  icon: Icon = FileQuestion,
  className,
}: NotFoundComponentProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backLink) {
      router.push(backLink);
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500", className)}>
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 backdrop-blur-sm">
        <Icon className="h-10 w-10 transition-transform hover:scale-110 duration-300" />
        <div className="absolute -inset-1 rounded-[2.25rem] border border-primary/20 animate-pulse" />
      </div>

      <h2 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      <p className="mb-10 max-w-sm text-base text-muted-foreground leading-relaxed">
        {description}
      </p>

      <div className="flex flex-col gap-3 min-w-[200px]">
        <Button
          onClick={handleBack}
          variant="outline"
          size="lg"
          className="h-12 border-neutral-200 bg-white shadow-sm hover:translate-x-[-2px] hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:translate-x-[-2px] mr-2" />
          {backText}
        </Button>
      </div>
    </div>
  );
}
