import { NotFoundPage } from "@/components/not-found-page";

export default function GlobalNotFound() {
  return (
    <NotFoundPage
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      backLabel="Go Back"
    />
  );
}
