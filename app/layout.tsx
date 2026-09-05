import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ReduxProvider } from "@/components/redux-provider";
import { PatternLayer } from "@/components/site/pattern-layer";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Koursier · Livraison de repas, colis et gaz à Douala",
    template: "%s · Koursier",
  },
  description:
    "Koursier livre vos restaurants préférés, vos colis et votre gaz domestique à Douala, par le livreur le plus proche, avec paiement Orange Money et MTN Mobile Money.",
  applicationName: "Koursier",
  icons: { icon: "/brand/koursier-mark.png", apple: "/brand/koursier-mark.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121422" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={cn(bricolage.variable, dmSans.variable)}>
      <body className="overscroll-none font-sans antialiased">
        <PatternLayer />
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange enableColorScheme>
            {children}
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
