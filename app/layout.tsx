import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuideFlow Clone",
  description: "Cross-site interactive demos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {/* Global Navigation Bar */}
          <nav className="p-4 border-b flex justify-between items-center bg-white">
            <span className="font-bold text-xl">GuideFlow Clone</span>
            <div>
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>
          
          {/* Main Content */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}