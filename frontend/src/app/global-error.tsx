"use client";

import { useEffect } from "react";
import ErrorScreen from "@/Components/Shared/ErrorScreen";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen">
        <ErrorScreen
          code="500"
          title="Something went wrong"
          description="The application ran into a problem. Please try again or go back to the previous page."
          retry={retry}
          digest={error.digest}
        />


        
      </body>
    </html>
  );
}
