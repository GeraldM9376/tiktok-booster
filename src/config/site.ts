// src/config/site.ts
export const site = {
  name: "TikTok Booster",
  shortName: "Booster",
  tagline: "Boost your creator journey. Grow faster. Earn more.",
  description:
    "TikTok Booster helps creators grow their presence and earn rewards through structured engagement and campaign tools.",
  url: "https://tiktok-booster.vercel.app",
  links: {
    github: "https://github.com",
    support: "mailto:support@tiktok-booster.example",
  },
  nav: {
    marketing: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Stories", href: "#stories" },
      { label: "FAQ", href: "#faq" },
    ],
    earn: [
      { label: "Dashboard", href: "/earn/dashboard" },
      { label: "Marketplace", href: "/earn/marketplace" },
      { label: "Daily Tasks", href: "/earn/tasks/daily" },
      { label: "My Earnings", href: "/earn/earnings" },
      { label: "Ranks", href: "/earn/rank" },
      { label: "Referral", href: "/earn/referral" },
    ],
    creator: [
      { label: "Overview", href: "/creator/dashboard" },
      { label: "My Videos", href: "/creator/videos" },
      { label: "Campaigns", href: "/creator/campaigns" },
      { label: "Analytics", href: "/creator/analytics/audience" },
      { label: "Wallet", href: "/creator/wallet" },
      { label: "Top Up", href: "/creator/topup" },
    ],
    admin: [
      { label: "Overview", href: "/admin/dashboard" },
      { label: "Users", href: "/admin/users" },
      { label: "Top-Ups", href: "/admin/topups" },
      { label: "Withdrawals", href: "/admin/withdrawals" },
      { label: "Audit", href: "/admin/audit" },
    ],
  },
  auth: {
    earn: { login: "/earn/auth", redirect: "/earn/dashboard" },
    creator: { login: "/creator/auth", redirect: "/creator/dashboard" },
    admin: { login: "/admin/auth", redirect: "/admin/dashboard" },
  },
} as const;

export type Site = typeof site;