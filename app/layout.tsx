// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import { AppProvider } from "./contexts/app-context"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WashNDry - Smart Laundry Management System",
  description:
    "WashNDry is a cutting-edge laundry management system designed to streamline operations, enhance customer experience, and optimize resource utilization for laundromats and laundry services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AppProvider>
            {children}
          </AppProvider>
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}