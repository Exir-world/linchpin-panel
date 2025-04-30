"use client";
import { useEffect } from "react";
import { useLocale } from "next-intl";

export function FontProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    // حذف کلاس‌های فونت قبلی
    document.body.classList.remove("font-iransans", "font-sans");
    
    // اضافه کردن کلاس فونت جدید
    if (locale === "fa" || locale === "ar") {
      document.body.classList.add("font-iransans");
    } else {
      document.body.classList.add("font-sans");
    }
  }, [locale]);

  return <>{children}</>;
} 