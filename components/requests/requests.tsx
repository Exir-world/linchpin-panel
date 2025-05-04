"use client ";
import { RequestItem } from "@/helpers/types";
import { Get } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import CustomDropdown from "../dropdown/dropdown";
import clsx from "clsx";
import { Button, Spinner } from "@nextui-org/react";
import Icon from "../icon";
import formatDate from "@/helpers/dateConverter";

type ReqTypes = {
  requestId: number;
  title: string;
};

const RequestsList = () => {
  const [requests, setRequests] = useState([] as RequestItem[]);
  const t = useTranslations("global.requests");
  const [status, setStatus] = useState("All");
  const [reqTypes, setReqTypes] = useState([] as ReqTypes[]);
  const [isLoading, setIsLoading] = useState(true);
  const locale = useLocale();
  const router = useRouter();
  const cal = locale === "fa" ? "jalali" : "gregorian";

  const requestTypes = [
    {
      label: t("filter.all"),
      key: "null",
    },
    {
      label: t("filter.pending"),
      key: "PENDING",
    },
    {
      label: t("filter.approved"),
      key: "APPROVED",
    },
    {
      label: t("filter.rejected"),
      key: "REJECTED",
    },
    {
      label: t("filter.Cancelled"),
      key: "CANCELLED",
    },
  ];

  const getRequestst = async () => {
    const url =
      status === "All" || status === "null"
        ? "requests"
        : `requests?status=${status}`;
    try {
      setIsLoading(true);
      const res = await Get(url, {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200) {
        setRequests(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestTypes = async () => {
    try {
      const res = await Get("requests/request-types", {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200) {
        setReqTypes(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRequestst();
    getRequestTypes();
  }, [status]);

  const tableColumns = [
    // { name: t("id"), uid: "id" },
    {
      name: t("type"),
      uid: "type",
      render: (record: any) => {
        const type = reqTypes.find((el) => el.requestId == record.type)?.title;

        return <span>{type}</span>;
      },
    },
    {
      name: t("name"),
      uid: "name",
      render: (record: RequestItem) => {
        return (
          <div className="flex items-center ">
            {record.user.firstname} {record.user.lastname}
          </div>
        );
      },
    },
    {
      name: t("personnelCode"),
      uid: "personnelCode",
      render: (record: RequestItem) => {
        return (
          <div className="flex items-center ">{record.user.personnelCode}</div>
        );
      },
    },
    {
      name: t("status"),
      uid: "status",
      render: (record: any) => {
        const status = record.status;
        return (
          <span
            className={clsx(
              "py-1 px-2 rounded-full text-white text-xs font-semibold",
              status === "CANCELLED"
                ? "bg-cancelled"
                : status === "PENDING"
                ? "bg-pending"
                : status === "APPROVED"
                ? "bg-approved"
                : status === "REJECTED"
                ? "bg-rejected "
                : ""
            )}
          >
            {t(`filter.${status?.toLowerCase() || ""}`)}
          </span>
        );
      },
    },
    // { name: t("description"), uid: "description" },
    // { name: t("adminComment"), uid: "adminComment" },
    {
      name: t("startTime"),
      uid: "startTime",
      render: (record: any) => {
        return <span>{formatDate(record.startTime, locale, cal)} </span>;
      },
    },
    {
      name: t("endTime"),
      uid: "endTime",
      render: (record: any) => {
        return <span>{formatDate(record.endTime, locale, cal)}</span>;
      },
    },
    // { name: t("reviewedById"), uid: "reviewedById" },
    // {
    //   name: t("reviewedAt"),
    //   uid: "reviewedAt",
    //   render: (record: any) => {
    //     return (
    //       <span>{formatDate(new Date(record.reviewedAt), locale, cal)}</span>
    //     );
    //   },
    // },
    // {
    //   name: t("createdAt"),
    //   uid: "createdAt",
    //   render: (record: any) => {
    //     return <span>{formatDate(record.createdAt, locale, cal)} </span>;
    //   },
    // },
    // {
    //   name: t("updatedAt"),
    //   uid: "updatedAt",
    //   render: (record: any) => {
    //     return <span>{formatDate(record.updatedAt, locale, cal)} </span>;
    //   },
    // },
    {
      name: t("details"),
      uid: "details",
      render: (record: any) => {
        return (
          <Button
            color="primary"
            onPress={() => {
              router.push(`/requests/reqDetails?id=${record.id}`);
            }}
          >
            {t("details")}
            <Icon name="list-collapse"></Icon>
          </Button>
        );
      },
    },
  ];

  const handleChange = (val: string) => {
    if (val === t("All")) {
      setStatus("");
    }
    setStatus(val);
  };

  return (
    <div>
      <div className="flex items-center p-2 gap-3">
        <span>{t("status")}</span>
        <div className="w-1/5">
          <CustomDropdown
            dropdownItems={requestTypes}
            onChange={(val) => handleChange(val)}
          ></CustomDropdown>
        </div>
      </div>
      <div>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-[50vh] gap-4">
            <Spinner color="primary" />
            <span className="text-sm text-gray-500">{t("loading")}</span>
          </div>
        ) : (
          <ReusableTable
            columns={tableColumns}
            tableData={requests}
          ></ReusableTable>
        )}
      </div>
    </div>
  );
};

export default RequestsList;
