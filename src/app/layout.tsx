import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/*
 * Self-hosted from Fontshare under the ITF Free Font License (see
 * src/fonts/ITF-Free-Font-License.txt). Served whole and unmodified — the
 * licence forbids subsetting, so don't add a `subsets` transform here.
 */
const erode = localFont({
  variable: "--font-erode",
  display: "swap",
  src: [
    { path: "../fonts/Erode-Variable.woff2", weight: "300 800", style: "normal" },
    { path: "../fonts/Erode-VariableItalic.woff2", weight: "300 800", style: "italic" },
  ],
});

const switzer = localFont({
  variable: "--font-switzer",
  display: "swap",
  src: [{ path: "../fonts/Switzer-Variable.woff2", weight: "300 800", style: "normal" }],
});

export const metadata: Metadata = {
  title: "Notch — know what every client has left",
  description:
    "Notch tracks prepaid session packs for independent trainers, yoga teachers and music teachers. See what every client has left, get warned when they're nearly out, and send the renewal message before the last session.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${erode.variable} ${switzer.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
