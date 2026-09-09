import type { Metadata } from "next";
import { AuthProvider } from "@/Hooks/useAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Salary Portal",
  description: "Salary Portal application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
