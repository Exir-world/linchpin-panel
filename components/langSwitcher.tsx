"use client";
import React, { useEffect, useState } from "react";
import CustomDropdown from "./dropdown/dropdown";
import { usePathname } from "@/src/i18n/navigation";
import { useRouter } from "next/navigation";
import { getCookies } from "cookies-next";

const LangSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedLang, setSelectedLang] = useState<any>("");

  const langs = [
    { label: "English", key: "en" },
    { label: "Arabic", key: "ar" },
    { label: "فارسی", key: "fa" },
  ];

  const changeLanguage = (locale: string) => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length > 0) {
      // Replace the locale (first segment) with the new locale
      segments[0] = locale;
      const newPath = "/" + segments.join("/");
      router.push(newPath);
    } else {
      router.push(`/${locale}`);
    }
  };

  // const cookieLocale = document.cookie
  //   .split("; ")
  //   .find((row) => row.startsWith("NEXT_LOCALE="))
  //   ?.split("=");
  const cookieLocale = getCookies();

  useEffect(() => {
    const currentLange = langs.find(
      (el) => el.key === cookieLocale.NEXT_LOCALE
    );
    setSelectedLang(currentLange?.key);
  }, [pathname]);

  return (
    <div>
      <CustomDropdown
        onChange={(locale) => changeLanguage(locale)}
        dropdownItems={langs}
        selectedValue={selectedLang}
      ></CustomDropdown>
    </div>
  );
};

export default LangSwitcher;
