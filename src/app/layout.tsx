import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Bungee_Spice, Medula_One } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const bungee = Bungee_Spice({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

const medula = Medula_One({
  variable: "--font-medula",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "WelliBuilds CRM",
  description: "WelliBuilds CRM Dashboard for Lead Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${bungee.variable} ${medula.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
