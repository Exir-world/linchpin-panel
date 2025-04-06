"use client";
import React, { useEffect, useState } from "react";
import CustomDropdown from "./dropdown/dropdown";
import { usePathname } from "@/src/i18n/navigation";
import { useRouter } from "next/navigation";
import { getCookies } from "cookies-next";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useLocale } from "next-intl";

const LangSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();

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

  const locale = useLocale();

  return (
    <div>
      {/* <CustomDropdown
        onChange={(locale) => changeLanguage(locale)}
        dropdownItems={langs}
        selectedValue={selectedLang}
      ></CustomDropdown> */}
      <Dropdown>
        <DropdownTrigger>
          <Button variant="bordered">
            {langs.find((el) => el.key === locale)?.label}
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          {langs.map((el) => (
            <DropdownItem onClick={() => changeLanguage(el.key)} key={el.key}>
              {el.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LangSwitcher;
