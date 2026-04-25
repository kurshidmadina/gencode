import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://gencode.dev"),
  title: {
    default: "Gencode | Gamified technical skill training",
    template: "%s | Gencode"
  },
  description:
    "Master Linux, SQL, data structures, algorithms, and coding through level-based technical challenges.",
  keywords: [
    "coding challenges",
    "Linux training",
    "SQL practice",
    "DSA",
    "developer learning",
    "technical interviews"
  ],
  openGraph: {
    title: "Gencode",
    description: "A futuristic coding arena for technical skill growth.",
    url: "https://gencode.dev",
    siteName: "Gencode",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#07080f",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
