import { Fira_Code as FontMono, Inter as FontSans, Vazirmatn } from "next/font/google";
import localFont from "next/font/local";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const iranSans = localFont({
  src: [
    {
      path: "../public/fonts/Estedad-FD[KSHD,wght].ttf",
      style: "normal",
    },
  ],
  variable: "--font-iransans",
});
