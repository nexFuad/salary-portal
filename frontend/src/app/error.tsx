"use client";

import { useEffect } from "react";
import ErrorScreen from "@/Components/Shared/ErrorScreen";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title="Something went wrong"
      description="We couldn’t load this page right now. Please try again in a moment."
      retry={retry}
      digest={error.digest}
    />
  );
}
