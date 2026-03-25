import React from "react";
import { NotFoundComponent } from "@/components/not-found";

export default function DashboardNotFound() {
  return (
    <div className="flex h-[calc(100vh-120px)] items-center justify-center">
      <NotFoundComponent
        title="Page Not Found"
        description="The dashboard section you are looking for doesn't exist or has been moved."
        backLink="/dashboard"
        backText="Back to Dashboard"
      />
    </div>
  );
}
