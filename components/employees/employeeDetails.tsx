"use client";
import { User } from "@/helpers/types";
import { Get, Patch } from "@/lib/axios";
import { Button, Input, Switch } from "@nextui-org/react";
import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "../dropdown/dropdown";
import { useTranslations } from "next-intl";
import { Key } from "lucide-react";
import path from "path";
import { addToast } from "@heroui/toast";
import Organizationdropdown from "../organizationDropdown/organization-dropdown";

// const user: User = {
//   organizationId: 0,
//   firstname: "",
//   name: "",
//   profileImage: null,
//   lastname: "",
//   phoneNumber: "",
//   password: "",
//   role: {
//     name: "",
//     permissions: [],
//     id: 0,
//   },
//   nationalCode: null,
//   personnelCode: null,
//   isDeleted: false,
//   id: 0,
// };

const EmployeeDetails = () => {
  const params = useSearchParams();
  const [userData, setUserData] = useState({} as User);
  const [isEditing, setIsEditing] = useState(false);
  // const [formValues, setFormValues] = useState(user);
  const [roleList, setRoleList] = useState([]);
  // const [orgList, setOrgList] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [shiftList, setShiftList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [currentLocale, setCurrentLocale] = useState<string>();
  const pathname = usePathname();
  const t = useTranslations();

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
        // setUserData(res.data);
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
        setValue("teamId", res.data.settings?.teamId || '');
        setValue("salary", res.data.settings?.salary || 0);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getRoleList = async () => {
    try {
      const res = await Get(`/roles`, {
        headers: {
          "Accept-Language": currentLocale,
        },
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

  // const getOranizationList = async () => {
  //   try {
  //     const res = await Get("/organization/admin/organizations", {
  //       headers: {
  //         "Accept-Language": currentLocale,
  //       },
  //     });
  //     if (res.status === 200) {
  //       setOrgList(
  //         res.data.map((el: any) => ({
  //           key: +el.id,
  //           label: el.name,
  //         }))
  //       );
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getTeamLists = async () => {
    try {
      const res = await Get(`organization/${orgId}/teams`);
      console.log(res);
      if (res.status === 200)
        setTeamList(
          res.data.map((el: any) => ({
            key: +el.id,
            label: el.title,
          }))
        );
    } catch (error) {
      console.log(error);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
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

    try {
      const id = params.get("id");
      const res = await Patch(
        `/users/${id}`,
        {
          ...restOfData,
          settings,
          role: +data.role,
          organizationId: Number(orgId),
          profileImage: "",
        },
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );
      if (res.status === 200) {
        addToast({
          title: t("global.alert.success"),
          color: "success",
        });
      }
    } catch (error) {
      console.log(error);
    }
    // Here you would make an API request to save the updated data
  };

  useEffect(() => {
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
    getUserById();
    getRoleList();
    // getOranizationList();
  }, []);

  const getShifts = async () => {
    try {
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
    getShifts();
    getTeamLists();
  }, [orgId]);

  const handleOrgId = (val: any) => {
    setOrgId(val);
  };
  return (
    <div>
      <div className="p-4">
        {t("global.employee.editUser")}
        <Button
          type="button"
          variant="bordered"
          color="primary"
          onPress={() => {
            setIsEditing(!isEditing);
          }}
        >
          {isEditing ? t("global.employee.save") : t("global.employee.edit")}
        </Button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex p-3 gap-2">
        <div className="flex flex-col items-center w-full gap-3 ">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-2">
            <div>
              <Controller
                name="firstname"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    color={isEditing ? "primary" : "default"}
                    label={t("global.employee.firstname")}
                    disabled={!isEditing}
                    // helperText={errors.firstname ? errors.firstname.message : ""}
                    // helperColor={errors.firstname ? "error" : undefined}
                  />
                )}
                // rules={{ required: "First name is required" }}
              />
            </div>
            <div>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    color={isEditing ? "primary" : "default"}
                    label={t("global.employee.nickname")}
                    disabled={!isEditing}
                    // helperText={errors.name ? errors.name.message : ""}
                    // helperColor={errors.name ? "error" : undefined}
                  />
                )}
                // rules={{ required: "Name is required" }}
              />
            </div>
            <div>
              <Controller
                name="lastname"
                control={control}
                render={({ field }) => (
                  <Input
                    color={isEditing ? "primary" : "default"}
                    {...field}
                    label={t("global.employee.create.lastname")}
                    disabled={!isEditing}
                    // helperText={errors.lastname ? errors.lastname.message : ""}
                    // helperColor={errors.lastname ? "error" : undefined}
                  />
                )}
                // rules={{ required: "Last name is required" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-2">
            <div>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    color={isEditing ? "primary" : "default"}
                    label={t("global.employee.phoneNumber")}
                    disabled={!isEditing}
                    // helperText={
                    //   errors.phoneNumber ? errors.phoneNumber.message : ""
                    // }
                    // helperColor={errors.phoneNumber ? "error" : undefined}
                  />
                )}
                // rules={{
                //   required: "Phone number is required",
                //   pattern: {
                //     value: /^\d{10}$/,
                //     message: "Phone number must be 10 digits",
                //   },
                // }}
              />
            </div>
            <div>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    color={isEditing ? "primary" : "default"}
                    label={t("global.employee.password")}
                    type="password"
                    disabled={!isEditing}
                    // helperText={errors.password ? errors.password.message : ""}
                    // helperColor={errors.password ? "error" : undefined}
                  />
                )}
                // rules={{
                //   required: "Password is required",
                //   minLength: {
                //     value: 6,
                //     message: "Password must be at least 6 characters",
                //   },
                // }}
              />
            </div>
            <div>
              <Controller
                name="nationalCode"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    color={isEditing ? "primary" : "default"}
                    label={t("global.employee.nationalCode")}
                    disabled={!isEditing}
                    // helperText={
                    //   errors.nationalCode ? errors.nationalCode.message : ""
                    // }
                    // helperColor={errors.nationalCode ? "error" : undefined}
                  />
                )}
                // rules={{
                //   pattern: {
                //     value: /^\d{10}$/,
                //     message: "National code must be 10 digits",
                //   },
                // }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-2">
            <div>
              <Controller
                name="personnelCode"
                control={control}
                rules={{
                  required: "Personnel code is required",
                }}
                render={({ field, formState }) => {
                  return (
                    <Input
                      {...field}
                      color={isEditing ? "primary" : "default"}
                      label={t("global.employee.personnelCode")}
                      disabled={!isEditing}
                      // helperText={
                      //   errors.personnelCode ? errors.personnelCode.message : ""
                      // }
                      // helperColor={errors.personnelCode ? "error" : undefined}
                    />
                  );
                }}
                // rules={{
                //   pattern: {
                //     value: /^\d{6}$/,
                //     message: "Personnel code must be 6 digits",
                //   },
                // }}
              />
            </div>
            <div>
              <Controller
                name="salary"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    color={isEditing ? "primary" : "default"}
                    label={t("global.employee.create.settings.salary")}
                    disabled={!isEditing}
                    // helperText={
                    //   errors.phoneNumber ? errors.phoneNumber.message : ""
                    // }
                    // helperColor={errors.phoneNumber ? "error" : undefined}
                  />
                )}
                // rules={{
                //   required: "Phone number is required",
                //   pattern: {
                //     value: /^\d{10}$/,
                //     message: "Phone number must be 10 digits",
                //   },
                // }}
              />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm text-gray-700 ">
                {t("global.employee.create.role")}
              </span>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <CustomDropdown
                    dropdownItems={roleList}
                    onChange={field.onChange}
                    // selectedValue={field.value}
                  />
                )}
              />
              {errors.role && (
                <span className="text-red-500 text-sm">
                  {errors.role.message as any}
                </span>
              )}
            </div>
            <div className="flex items-center flex-col gap-0.5">
              <span className="text-sm text-gray-700">
                {t("global.employee.create.organizationId")}
              </span>
              <Controller
                control={control}
                name="organizationId"
                render={({ field }) => (
                  <Organizationdropdown
                    onChange={(val) => {
                      field.onChange(val);
                      handleOrgId(val);
                    }}
                  />
                )}
              />

              {/* <CustomDropdown
                dropdownItems={orgList}
                onChange={(val) => handleOrgId(val)}
              /> */}
              {errors.organizationId && (
                <span className="text-red-500 text-sm">
                  {errors?.organizationId?.message as any}
                </span>
              )}
            </div>
            <div className="flex items-center flex-col gap-0.5">
              <span className="text-sm text-gray-700">
                {/* {t("global.employee.create.organizationId")} */}
                {t("global.employee.create.settings.shiftId")}
              </span>

              <Controller
                control={control}
                name="shiftId"
                render={({ field }) => (
                  <CustomDropdown
                    dropdownItems={shiftList}
                    onChange={(val) => {
                      const numericVal = Number(val);
                      field.onChange(numericVal);
                    }}
                    selectedValue={field.value as any}
                  />
                )}
              />
              {errors.organizationId && (
                <span className="text-red-500 text-sm">
                  {errors?.organizationId?.message as any}
                </span>
              )}
            </div>
            <div className="flex items-center flex-col gap-0.5">
              <span className="text-sm text-gray-700">
                {/* {t("global.employee.create.organizationId")} */}
                {t("global.employee.create.settings.teamId")}
              </span>
              <Controller
                control={control}
                name="teamId"
                render={({ field }) => (
                  <CustomDropdown
                    dropdownItems={teamList}
                    onChange={field.onChange}
                    // selectedValue={field.value}
                  />
                )}
              />
              {errors.organizationId && (
                <span className="text-red-500 text-sm">
                  {errors?.organizationId?.message as any}
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="flex  items-center gap-1">
              <span>{t("global.employee.create.settings.needToLocation")}</span>
              <Controller
                control={control}
                name="needToLocation"
                render={({ field }) => (
                  <Switch
                    {...field}
                    // isSelected={false}
                    onChange={(checked) => field.onChange(checked)}
                  />
                )}
              />
            </div>
          </div>
          <div className="p-4 flex gap-4 w-full items-center justify-center">
            <Button
              type="button"
              color="danger"
              onPress={() => setIsEditing(false)}
            >
              {t("global.employee.cancel")}
            </Button>
            <Button type="submit" color="primary">
              {t("global.employee.update")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeDetails;
