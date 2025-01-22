import { Inter } from "next/font/google";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pomodoro",
  description: "A Pomodoro Timer to help you stay focused and boost your productivity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}