import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/CustomCursor";
import { GridBackground } from "@/components/GridBackground";
import { Navigation } from "@/components/Navigation";
import { LayoutProvider } from "@/context/LayoutContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Folio",
  description: "My personal developer platform and digital garden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="antialiased font-mono font-light">
        <LayoutProvider>
          <GridBackground />
          <CustomCursor />
          <Navigation />
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
