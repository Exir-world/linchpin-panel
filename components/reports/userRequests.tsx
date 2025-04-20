"use client";
import { Button, Checkbox, Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { ExportIcon } from "@/components/icons/accounts/export-icon";
import { useTranslations } from "next-intl";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Get } from "@/lib/axios";
import { User } from "@/helpers/types";
import { useRouter } from "next/navigation";

export const UserRequests = () => {
  const [value, setValue] = useState<any>();
  const [userList, setUserList] = useState([]);
  const t = useTranslations();
  const router = useRouter();
  
  const getUsersList = async () => {
    try {
      const res = await Get(`/users`);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // getUsersList();
  }, []);

  const tableColumns = [
    { name: t("global.employee.personnelCode"), uid: "personnelCode" },
    {
      name: t("global.employee.fullName"),
      uid: "firstname",
      render: (record: User) => {
        return <div>{`${record.firstname}${record.lastname}`}</div>;
      },
    },
    { name: t("global.employee.phoneNumber"), uid: "phoneNumber" },
    { name: t("global.employee.password"), uid: "password" },
    { name: t("global.employee.nationalCode"), uid: "nationalCode" },
    {
      name: t("global.employee.isDeleted"),
      uid: "isDeleted",
      render: (record: User) => {
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              defaultChecked={record.isDeleted}
              color="danger"
              isReadOnly
            />
          </div>
        );
      },
    },
    {
      name: t("global.employee.details"),
      uid: "details",
      render: (record: User) => {
        return (
          <Button
            className="bg-blue-500 text-white"
            onPress={() => router.push(`/employees/userId?id=${record.id}`)}
          >
            {t("global.employee.details")}
          </Button>
        );
      },
    },
  ];

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
    <div className="w-full flex flex-col gap-4 ">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        <div className="flex justify-between gap-3 w-full">
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
            <Button color="primary" startContent={<ExportIcon />}>
              Export to Exell
            </Button>
          </div>
        </div>
      </div>

      {/* <ReusableTable
        columns={tableColumns}
        tableData={tableCols}
      ></ReusableTable> */}
    </div>
  );
};
