import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Sidebar from "@/src/components/Sidebar";
import SearchBar from "@/src/components/SearchBar";
import CreateOrganizationModal from "@/src/components/CreateOrganizationModal";
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
  title: "GUIO.",
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
          <SignedIn>
            <CreateOrganizationModal />
          </SignedIn>

          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area with top bar */}
            <div className="flex-1 ml-60">
              {/* Top Search Bar */}
              <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
                <div className="flex items-center gap-4">
                  <SearchBar />
                  <SignedOut>
                    <SignInButton mode="modal" />
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </header>

              {/* Page Content */}
              <main className="bg-gray-50">
                {children}
              </main>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}