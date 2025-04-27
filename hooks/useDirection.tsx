import { useLocale } from "next-intl";
import React, { useMemo } from "react";

const useDir = () => {
  const locale = useLocale();

  const dir = useMemo(() => (locale === "en" ? "ltr" : "rtl"), [locale]);

  return dir;
};

export default useDir;
