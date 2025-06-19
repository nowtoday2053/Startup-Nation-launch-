import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Where Founders Learn, Build & Grow Together",
  description: "Discover, share, and discuss the best startup resources, strategies, and stories. Join the premier community for startup founders and entrepreneurs.",
  keywords: ["startup", "entrepreneurship", "resources", "strategies", "community", "founders"],
  authors: [{ name: "Startup Nation" }],
  creator: "Startup Nation",
  publisher: "Startup Nation",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Where Founders Learn, Build & Grow Together",
    description: "Discover, share, and discuss the best startup resources, strategies, and stories.",
    siteName: "Startup Nation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Startup Nation - Where Founders Learn, Build & Grow Together",
    description: "Discover, share, and discuss the best startup resources, strategies, and stories.",
          creator: "@startupnation",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative min-h-screen bg-white">
            {children}
          </div>
          
          <Toaster />
        </Providers>
      </body>
    </html>
  )
} 