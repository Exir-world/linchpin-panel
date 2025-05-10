"use client";
import { Get, Patch } from "@/lib/axios";
import { Button, Input, Switch, Card, CardBody } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "../dropdown/dropdown";
import { useLocale, useTranslations } from "next-intl";
import { addToast } from "@heroui/toast";
import Organizationdropdown from "../organizationDropdown/organization-dropdown";

type DropdownTypes = {
  key: string;
  label: string;
};

const EmployeeDetails = () => {
  const params = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [roleList, setRoleList] = useState<DropdownTypes[]>([]);
  const [orgId, setOrgId] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  const [teamList, setTeamList] = useState<any>([]);
  const t = useTranslations();
  const locale = useLocale();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstname: "",
      name: "",
      lastname: "",
      phoneNumber: "",
      password: "",
      nationalCode: "",
      personnelCode: "",
      role: null,
      organizationId: "",
      shiftId: 0,
      teamId: 0,
      salary: "",
      needToLocation: undefined,
    },
  });

  const getUserById = async () => {
    const id = params.get("id");
    try {
      if (id) {
        const res = await Get(`users/${id}`);
        setValue("firstname", res.data.firstname || "");
        setValue("name", res.data.name || "");
        setValue("lastname", res.data.lastname || "");
        setValue("phoneNumber", res.data.phoneNumber || "");
        setValue("password", res.data.password || "");
        setValue("nationalCode", res.data.nationalCode || "");
        setValue("personnelCode", res.data.personnelCode || "");
        setValue("role", res.data.role?.id || null);
        setValue("organizationId", res.data.organizationId || "");
        setOrgId(res.data.organizationId || null);
        setValue("shiftId", res.data.settings?.shiftId || 0);
        setValue("teamId", res.data.settings?.teamId || "");
        setValue("salary", res.data.settings?.salary || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getRoleList = async () => {
    try {
      const res = await Get(`/roles`, {
        headers: { "Accept-Language": locale },
      });
      if (res.status === 200) {
        setRoleList(
          res.data.map((el: any) => ({ key: Number(el.id), label: el.name }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTeamLists = async () => {
    try {
      if (!orgId) return;
      const res = await Get(`organization/${orgId}/teams`);
      if (res.status === 200) {
        setTeamList(
          res.data.map((el: any) => ({ key: +el.id, label: el.title }))
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getShifts = async () => {
    try {
      if (!orgId) return;
      const res = await Get(`shifts/organization/${orgId}`);
      if (res.status === 200) {
        const allShifts = res.data.map((el: any) => ({
          key: el.id,
          label: el.title,
        }));
        setShiftList(allShifts);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserById();
    getRoleList();
  }, []);

  useEffect(() => {
    getShifts();
    getTeamLists();
  }, [orgId]);

  const handleOrgId = (val: any) => {
    setOrgId(val);
  };

  const onSubmit = async (data: any) => {
    const settings = {
      teamId: Number(data.teamId),
      shiftId: Number(data.shiftId) || 1,
      salary: Number(data.salary),
      needToLocation: data.needToLocation || false,
    };
    const { teamId, shiftId, salary, needToLocation, role, ...restOfData } =
      data;
    const id = params.get("id");
    try {
      if (!id) return;
      const res = await Patch(
        `/users/${id}`,
        {
          ...restOfData,
          settings,
          role: +data.role,
          organizationId: Number(orgId),
          profileImage: "",
        },
        { headers: { "Accept-Language": locale } }
      );
      if (res.status === 200 || res.status === 201) {
        addToast({ title: t("global.alert.success"), color: "success" });
      } else {
        addToast({ title: t("global.alert.error"), color: "danger" });
      }
    } catch (error) {
      addToast({ title: t("global.alert.error"), color: "danger" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          {t("global.employee.editUser")}
        </h1>
        <Button
          variant={isEditing ? "solid" : "bordered"}
          color="primary"
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? t("global.employee.save") : t("global.employee.edit")}
        </Button>
      </div>

      <Card shadow="sm">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "firstname", label: t("global.employee.firstname") },
                {
                  name: "lastname",
                  label: t("global.employee.create.lastname"),
                },
                { name: "name", label: t("global.employee.nickname") },
                {
                  name: "phoneNumber",
                  label: t("global.employee.phoneNumber"),
                },
                {
                  name: "password",
                  label: t("global.employee.password"),
                  type: "password",
                },
                {
                  name: "nationalCode",
                  label: t("global.employee.nationalCode"),
                },
                {
                  name: "personnelCode",
                  label: t("global.employee.personnelCode"),
                },
                {
                  name: "salary",
                  label: t("global.employee.create.settings.salary"),
                },
              ].map((fieldConfig) => (
                <Controller
                  key={fieldConfig.name}
                  name={fieldConfig.name as any}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type={fieldConfig.type ?? "text"}
                      color={isEditing ? "primary" : "default"}
                      label={fieldConfig.label}
                      disabled={!isEditing}
                    />
                  )}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("global.employee.create.role")}
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <CustomDropdown
                      dropdownItems={roleList}
                      onChange={field.onChange}
                      selectedValue={
                        roleList.find((el) => el.key == field.value)?.label
                      }
                    />
                  )}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.role.message as any}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("global.employee.create.organizationId")}
                </label>
                <Controller
                  name="organizationId"
                  control={control}
                  render={({ field }) => (
                    <Organizationdropdown
                      onChange={(val) => {
                        field.onChange(val);
                        handleOrgId(val);
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("global.employee.create.settings.shiftId")}
                </label>
                <Controller
                  name="shiftId"
                  control={control}
                  render={({ field }) => (
                    <CustomDropdown
                      dropdownItems={shiftList}
                      onChange={(val) => field.onChange(Number(val))}
                      selectedValue={field.value as any}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("global.employee.create.settings.teamId")}
                </label>
                <Controller
                  name="teamId"
                  control={control}
                  render={({ field }) => (
                    <CustomDropdown
                      dropdownItems={teamList}
                      onChange={field.onChange}
                      selectedValue={
                        teamList.find((el: any) => el.key == field.value)?.label
                      }
                    />
                  )}
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {t("global.employee.create.settings.needToLocation")}
                </span>
                <Controller
                  name="needToLocation"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      isSelected={Boolean(field.value)}
                      onValueChange={(value) => field.onChange(value)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 border-t mt-6">
              <Button
                type="button"
                color="danger"
                variant="flat"
                onPress={() => setIsEditing(false)}
              >
                {t("global.employee.cancel")}
              </Button>
              <Button type="submit" color="primary">
                {t("global.employee.update")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default EmployeeDetails;
