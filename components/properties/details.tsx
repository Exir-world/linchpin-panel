"use client";
import { PropertyDetail } from "@/helpers/types";
import { Del, Get, Put } from "@/lib/axios";
import { Button, Input } from "@nextui-org/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "../dropdown/dropdown";
import formatDate from "@/helpers/dateConverter";
import { addToast } from "@heroui/toast";

enum PropertyStatusEnum {
  GOOD = "good",
  BROKEN = "broken",
}

const PropertyDetails = () => {
  const [propertyDetail, setPropertyDetail] = useState({} as PropertyDetail);
  const [editMode, setEditMode] = useState(false);
  const [orgList, setOrgList] = useState([]);
  const [orgId, setOrgId] = useState<any>(null);
  const [departmentList, setDepartmentList] = useState([]);
  const { handleSubmit, register, control, setValue } = useForm();
  const locale = useLocale();
  const params = useSearchParams();
  const t = useTranslations("global.properties");
  const calType = locale == "en" ? "gregorian" : "jalali";
  const getPropertyById = async () => {
    const id = params.get("id");
    if (!id) return;
    const res = await Get(`properties/${id}`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (res.status === 200) {
      setPropertyDetail(res.data);
      setValue("code", res.data.code || "");
      setValue("id", res.data.id || "");
      setValue("title", res.data.title || "");
      setValue("status", res.data.status || "");
      //   setValue("organizationId", res.data.organizationId || "");
      //   setValue("departmentId", res.data.departmentId || "");
    }
  };

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

  const statusDropdownItems = Object.keys(PropertyStatusEnum).map((el) => ({
    key: el,
    label: el,
  }));

  useEffect(() => {
    getPropertyById();
    getOranizationList();
  }, []);

  useEffect(() => {
    getDepartmentList();
  }, [orgId]);

  const onSubmit = async (data: any) => {
    const id = params.get("id");
    if (!id) return;
    const apiParams = {
      title: data.title,
      code: data.code,
      status: data.status,
      organizationId: data.organizationId,
      departmentId: data.departmentId,
    };

    const res = await Put(`properties/${id}`, { ...apiParams });
    console.log(res);
    if (res.status === 200) {
      addToast({
        title: t("success"),
        color: "success",
      });
    }
  };

  const handleDeleteProperty = async () => {
    const id = params.get("id");
    if (!id) return;
    const res = await Del(`properties/${id}`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (res.status === 200) {
      addToast({
        title: t("success"),
        color: "danger",
      });
    }
  };

  return (
    <div className="w-full p-2">
      <div className=" w-full flex items-end  justify-between p-3">
        <div>
          <Button onPress={() => setEditMode(!editMode)}>
            {editMode ? t("show") : t("edit")}
          </Button>
        </div>

        <div className="">
          <p>
            {t("title")}: {propertyDetail.title}{" "}
          </p>
          <p>
            {t("createdAt")}:
            {formatDate(propertyDetail.createdAt, locale, calType)}{" "}
          </p>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full ">
        <div className="grid w-full grid-cols-2 justify-center items-end gap-3">
          <div className="flex flex-col gap-3">
            <div>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input
                    readOnly={!editMode}
                    color={editMode ? "primary" : "default"}
                    label={t("code")}
                    {...field}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    readOnly={!editMode}
                    color={editMode ? "primary" : "default"}
                    label={t("title")}
                    {...field}
                  />
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm">{t("status")}</p>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <CustomDropdown
                    dropdownItems={statusDropdownItems}
                    onChange={(val) => {
                      field.onChange(val);
                    }}
                    selectedValue={field.value}
                  />
                )}
              />
            </div>
            <div>
              <div className="text-sm">{t("organizationId")}</div>
              <Controller
                name="organizationId"
                control={control}
                render={({ field }) => (
                  <CustomDropdown
                    dropdownItems={orgList}
                    onChange={(val) => {
                      const numericVal = Number(val);
                      setOrgId(numericVal);
                      field.onChange(numericVal);
                    }}
                    selectedValue={field.value}
                  />
                )}
              />
            </div>
          </div>
          <div>
            {editMode && (
              <>
                <div className="text-sm py-2">{t("departmentId")}</div>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <CustomDropdown
                      dropdownItems={departmentList}
                      onChange={(val) => {
                        const numericVal = Number(val);
                        setOrgId(numericVal);
                        field.onChange(numericVal);
                      }}
                      selectedValue={field.value}
                    />
                  )}
                />
              </>
            )}
          </div>
        </div>
        <div className="w-full flex justify-center items-center gap-x-6 py-6">
          <Button type="button" color="danger" onPress={handleDeleteProperty} isDisabled={!editMode} >
            {t("delete")}
          </Button>
          <Button type="submit" color="primary" isDisabled={!editMode}>
            {t("update")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyDetails;
