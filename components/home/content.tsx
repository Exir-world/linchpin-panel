"use client";
import React from "react";
import { useTranslations } from "next-intl";

export const Content = () => {
  const t = useTranslations();
  return (
    <div className="h-full lg:px-6">
      <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
        <div className="mt-6 gap-6 flex flex-col w-full">
          <div className="flex flex-col gap-2">{t("global.title")}</div>
        </div>
      </div>
    </div>
  )
};
