import type { Metadata } from "next";
import { ToastProvider } from "@/Components/Shared/Toast";
import { AuthProvider } from "@/Hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salary Portal",
  description: "Salary Portal application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
