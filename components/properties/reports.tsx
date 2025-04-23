"use client";
import { Get } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import formatDate from "@/helpers/dateConverter";

interface PropertyReport {
  id: number;
  userId: number;
  propertyId: number;
  report: string;
  status: string;
  createdAt: string;
}

const PropertyReports = () => {
  const [reportList, setReportList] = useState<PropertyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();
  const t = useTranslations();

  const getAllReports = async () => {
    try {
      setIsLoading(true);
      const res = await Get(`property-reports/all`, {
        headers: {
          "Accept-Language": locale,
        },
      });
      console.log(res);
      if (res.status === 200 || res.status === 201) {
        setReportList(res.data);
      }
    } catch (error) {
      throw new Error("failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllReports();
  }, []);

  const tableCols = [
    { name: t("global.porperty-reports.userId"), uid: "userId" },
    { name: t("global.porperty-reports.propertyId"), uid: "propertyId" },
    { name: t("global.porperty-reports.report"), uid: "report" },
    { name: t("global.porperty-reports.status"), uid: "status" },
    {
      name: t("global.porperty-reports.createdAt"),
      uid: "createdAt",
      render: (record: PropertyReport) => {
        const calandarTypes = locale === "en" ? "gregorian" : "jalali";
        return (
          <span>{formatDate(record.createdAt, locale, calandarTypes)} </span>
        );
      },
    },
  ];

  return (
    <div>
      <ReusableTable columns={tableCols} tableData={reportList}></ReusableTable>
    </div>
  );
};

export default PropertyReports;
