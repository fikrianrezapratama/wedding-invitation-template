import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Manrope,
  Playfair_Display,
  Plus_Jakarta_Sans
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"]
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Undangan Lamaran Digital",
  description: "Website undangan lamaran dengan halaman admin, RSVP, dan kirim WhatsApp."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${cormorant.variable} ${playfair.variable} ${jakarta.variable} ${manrope.variable} bg-stone-100 text-stone-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

