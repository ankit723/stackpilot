import type { Metadata } from "next";


export const metadata: Metadata = {
    title: "Stack Pilot",
    description: "Stack Pilot is a platform for managing your software development stack.",
    keywords: ["software development", "custom software", "software solutions", "business software", "software company", "Technology Solutions", "Software Development Company", "Custom Software Development", "Software Solutions for Businesses", "Technology Company"],
    authors: [{ name: "Stack Pilot", url: "https://www.stackpilot.com" }],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: "Stack Pilot",
      description: "Stack Pilot is a platform for managing your software development stack.",
      url: "https://www.stackpilot.com",
      siteName: "Stack Pilot",
      images: [{ url: "https://www.techmorphers.com/og-image.png", width: 1200, height: 630, alt: "Tech Morphers" }],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Stack Pilot",
      description: "Stack Pilot is a platform for managing your software development stack.",
      images: [{ url: "https://www.stackpilot.com/og-image.png" }],
    },
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: "https://www.stackpilot.com",
    },
    category: "technology",
    creator: "Stack Pilot",
    publisher: "Tech Morphers",
};