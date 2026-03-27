import { NotFoundPage } from "@/components/not-found-page";

export default function RequestNotFound() {
  return (
    <NotFoundPage
      title="Request Not Found"
      description="The request you're looking for doesn't exist or may have been removed."
      backLabel="Back to Requests"
      backHref="/requests"
    />
  );
}
