import "@/styles/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans, fontMono, iranSans } from "@/config/fonts";
import clsx from "clsx";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "Linchpin",
  description: "created by Exir",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} >
      <body
        className={clsx(
          "font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
          iranSans.variable,
          locale === "fa" ? "font-iransans" : "font-sans"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
