"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "@/src/i18n/navigation";
import { useRouter } from "next/navigation";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useLocale } from "next-intl";

const LangSwitcher = () => {
  const locale = useLocale();
  const [selectedLang, setSelectedLang] = useState(locale);
  const router = useRouter();
  const pathname = usePathname();

  const langs = [
    { label: "English", key: "en" },
    { label: "Arabic", key: "ar" },
    { label: "فارسی", key: "fa" },
  ];

  const changeLanguage = (newLocale: any) => {
    const segments = pathname.split("/").filter(Boolean);
    let newPath = "";

    // چک کن که آیا زبان توی مسیر هست یا نه
    if (segments.length > 0 && langs.some((lang) => lang.key === segments[0])) {
      segments[0] = newLocale; 
      newPath = "/" + segments.join("/");
    } else {
      newPath = `/${newLocale}${pathname === "/" ? "" : pathname}`; // اضافه کردن زبان
    }

    router.push(newPath, { scroll: false });
    setSelectedLang(newLocale);
  };
  useEffect(() => {
    setSelectedLang(locale); // همگام‌سازی زبان با locale فعلی
  }, [locale]);
  
  return (
    <div>
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
