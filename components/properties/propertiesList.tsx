"use client";
import { Get } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import CustomDropdown from "../dropdown/dropdown";
import ReusableTable from "../reusabelTable/table";
import formatDate from "@/helpers/dateConverter";
import { Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import Icon from "../icon";

const PropertiesList = () => {
  const [orgList, setOrgList] = useState([]);
  const [orgId, setOrgId] = useState<null | string>(null);
  const [departmentId, setDepartmentId] = useState<null | string>(null);
  const [departmentList, setDepartmentList] = useState([]);
  const [propertyList, setPropertyList] = useState([]);
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("global.properties");

  const getOranizationList = async () => {
    try {
      const res = await Get("/organization/admin/organizations", {
        headers: {
          "Accept-Language": locale,
        },
      });

      if (res.status === 200) {
        setOrgList(
          res.data.map((el: any) => ({
            key: +el.id,
            label: el.name,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const getFilteredPropertiesList = async () => {
  //   const res = await Get(
  //     `properties?organizationId=${orgId}&departmentId=${departmentId}`,
  //     {
  //       headers: {
  //         "Accept-Language": locale,
  //       },
  //     }
  //   );

  // };

  const getDepartmentList = async () => {
    if (!orgId) return;
    const res = await Get(`organization/${orgId}/departments`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (res.status === 200) {
      const departments = res?.data.map((el: any) => ({
        key: el.id,
        label: el.title,
      }));
      const optional = { key: "انتخاب همه", label: "انتخاب همه" };
      const data = [optional, ...departments];
      setDepartmentList(data as []);
    }
  };

  const getPropertyList = async () => {
    if (orgId || departmentId) {
      const res = await Get(
        `properties?organizationId=${orgId}&departmentId=${departmentId}`,
        {
          headers: {
            "Accept-Language": locale,
          },
        }
      );
      setPropertyList(res.data);
    }
  };

  useEffect(() => {
    getOranizationList();
  }, []);

  // useEffect(() => {
  //   getDepartmentList();
  // }, [orgId]);

  useEffect(() => {
    getDepartmentList();
    // getFilteredPropertiesList();
    getPropertyList();
  }, [orgId, departmentId]);

  const tableCols = [
    { name: t("id"), uid: "id" },
    { name: t("title"), uid: "title" },
    { name: t("code"), uid: "code" },
    { name: t("status"), uid: "status" },
    {
      name: t("createdAt"),
      uid: "createdAt",
      render: (record: any) => {
        const calType = locale == "en" ? "gregorian" : "jalali";
        return <span>{formatDate(record.createdAt, locale, calType)}</span>;
      },
    },
    // { name: t("organizationId"), uid: "organizationId" },
    { name: t("departmentId"), uid: "departmentId" },
    {
      name: t("details"),
      uid: "",
      render: (record: any) => {
        return (
          <Button
            color="secondary"
            className="rounded-full "
            onPress={() => router.push(`/properties/details?id=${record.id}`)}
          >
            {t("details")}
            <Icon name="notebook-tabs"></Icon>
          </Button>
        );
      },
    },
  ];
  return (
    <div>
      <div className="grid p-3 grid-cols-5 ">
        <div className="flex flex-col items-center gap-2">
          <span>{t("organization")}</span>
          <CustomDropdown
            dropdownItems={orgList}
            onChange={(val) => {
              setOrgId(val);
            }}
          />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span>{t("department")}</span>
          <CustomDropdown
            dropdownItems={departmentList}
            // selectedValue={departmentList.find(
            //   (item: any) => item.key === departmentId
            // )}
            onChange={(val) => {
              setDepartmentId(val);
            }}
          />
        </div>
      </div>
      <div>
        <ReusableTable
          columns={tableCols}
          tableData={propertyList}
        ></ReusableTable>
      </div>
    </div>
  );
};

export default PropertiesList;
