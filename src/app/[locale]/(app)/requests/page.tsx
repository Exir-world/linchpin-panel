"use client";
import CustomDropdown from "@/components/dropdown/dropdown";
import { useTranslations } from "next-intl";
import React from "react";

const Requests = () => {
  const t = useTranslations();
  const requestTypes = [
    {
      label: t("global.requests.filter.confirmed"),
      key: t("global.requests.filter.confirmed"),
    },
    {
      label: t("global.requests.filter.rejected"),
      key: t("global.requests.filter.rejected"),
    },
    {
      label: t("global.requests.filter.not-registered"),
      key: t("global.requests.filter.not-registered"),
    },
  ];

  const handleChange = (val: string) => {
    console.log(val);
  };

  return (
    <div>
      <div className="flex full p-2 ">
        <div className="flex items-center p-2 gap-3">
          <span>{t("global.requests.status")}</span>
          <CustomDropdown
            dropdownItems={requestTypes}
            onChange={(val) => handleChange(val)}
          ></CustomDropdown>
        </div>
      </div>
      Requests
    </div>
  );
};

export default Requests;
