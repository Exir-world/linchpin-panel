"use client";
import { Button, Input } from "@nextui-org/react";
import Link from "next/link";
import React, { useState } from "react";
import { DotsIcon } from "@/components/icons/accounts/dots-icon";
import { ExportIcon } from "@/components/icons/accounts/export-icon";
import { InfoIcon } from "@/components/icons/accounts/info-icon";
import { TrashIcon } from "@/components/icons/accounts/trash-icon";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import { SettingsIcon } from "@/components/icons/sidebar/settings-icon";
import { TableWrapper } from "@/components/table/table";
import { AddUser } from "./add-user";
import { useTranslations } from "next-intl";
import ReusableTable from "../reusabelTable/table";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export const Reports = () => {
  const t = useTranslations();

  const tableCols = [
    {
      walletId: 1,
      description: "Tony Reichert",
      amount: "CEO",
      AdminDescription: "Management",
      status: "active",
      Fee: "29",
      DestinationWalletAddress:
        "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      name: "tony.reichert@example.com",
    },
    {
      walletId: 1,
      description: "Tony Reichert",
      amount: "CEO",
      AdminDescription: "Management",
      status: "active",
      Fee: "29",
      DestinationWalletAddress:
        "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      name: "tony.reichert@example.com",
    },
  ];

  const tableColumns = [
    { name: "WalletId", uid: "walletId" },
    { name: "Amount", uid: "amount" },
    { name: "Fee", uid: "fee" },
    {
      name: "Status",
      uid: "status",
      render: (item: any) => {
        return (
          <span
            className={`text-white rounded-full py-1 px-2 text-sm ${
              item.status === "waiting"
                ? "bg-orange-500"
                : item.status === "pending"
                ? "bg-gray-500"
                : item.status === "completed"
                ? "bg-green-500"
                : item.status === "rejected"
                ? "bg-red-500"
                : "bg-red-300"
            }`}
          >
            {item.status}
          </span>
        );
      },
    },
    { name: "Description", uid: "description" },
    { name: "AdminDescription", uid: "adminDescription" },
    { name: "DestinationWalletAddress", uid: "destinationWalletAddress" },
    { name: "CreatedAt", uid: "createdAt" },
  ];
  const [value, setValue] = useState<any>();
  const handleRangeDate = (data: DateObject | any) => {
    if (data) {
      const persianDate = data.format("YYYY/MM/DD"); // e.g., "1404/01/19"

      const gregorianDate = data.convert().toDate(); 

      console.log("Persian Date:", persianDate);
      console.log("Gregorian Date:", gregorianDate);

      // Update state
      setValue(data);
    } else {
      console.log("No date selected");
    }
  };
  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}>
            <span>{t("global.home")}</span>
          </Link>
          <span> / </span>{" "}
        </li>

        <li className="flex gap-2">
          <UsersIcon />
          <span>{t("global.reports.reports")}</span>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <span>{t("global.reports.list")}</span>
        </li>
      </ul>

      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <Input
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search users"
          />
          <SettingsIcon />
          <TrashIcon />
          <InfoIcon />
          <DotsIcon />
        </div>
        <div className="flex items-center gap-3">
          <DatePicker
            value={value}
            onChange={(val) => handleRangeDate(val)}
            calendar={persian}
            locale={persian_fa}
            onOpenPickNewDate={false}
            placeholder={t("global.reports.selectDate")}
            style={{
              width: "90%",
              padding: "18px 10px",
              textAlign: "center",
              borderRadius: "15px",
              border: "1px solid #ccc",
            }}
          />
          <div className="flex flex-row gap-3.5 flex-wrap">
            {/* <AddUser /> */}
            <Button color="primary" startContent={<ExportIcon />}>
              Export to Exell
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-[95rem] mx-auto w-full">
        {/* <TableWrapper /> */}
      </div>
      <ReusableTable
        columns={tableColumns}
        tableData={tableCols}
      ></ReusableTable>
    </div>
  );
};
