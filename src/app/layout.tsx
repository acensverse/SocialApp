import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { TopNav } from "@/components/layout/TopNav";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social App",
  description: "A modern social media experience",
};

import { Providers } from "@/components/Providers";

import { MainLayout } from "@/components/layout/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-background text-foreground antialiased")}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <MainLayout>
              {children}
            </MainLayout>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
