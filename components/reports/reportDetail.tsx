"use client";
import { Button, Checkbox, Input, Tab, Tabs } from "@nextui-org/react";
import React, { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { Get } from "@/lib/axios";
import { User } from "@/helpers/types";
import { useRouter, useSearchParams } from "next/navigation";
import EmployeeDetails from "../employees/employeeDetails";
import UserProperties from "./userProperties";
import UserAttendace from "./userAttendace";
import { UserRequests } from "./userRequests";

const ReportDetails = () => {
  const [value, setValue] = useState<any>();
  const [userList, setUserList] = useState([]);
  const t = useTranslations();
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const getUsersList = async () => {
    try {
      const res = await Get(`/users`);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsersList();
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
    <div className="py-2 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <Tabs
        aria-label="Options"
        selectedKey={selected}
        className="justify-center"
        onSelectionChange={setSelected as any}
      >
        <Tab key="details" title={t("global.reports.details")}>
          <EmployeeDetails></EmployeeDetails>
        </Tab>
        <Tab key="attendance" title={t("global.reports.attendance")}>
          <UserAttendace></UserAttendace>
        </Tab>
        <Tab key="requests" title={t("global.reports.requests")}>
          <UserRequests></UserRequests>
        </Tab>
        <Tab key="properties" title={t("global.reports.properties")}>
          <UserProperties></UserProperties>
        </Tab>
      </Tabs>

      <div className="max-w-[95rem] mx-auto w-full">
        {/* <TableWrapper /> */}
      </div>
      {/* <ReusableTable
        columns={tableColumns}
        tableData={tableCols}
      ></ReusableTable> */}
    </div>
  );
};

export default ReportDetails;
