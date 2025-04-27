"use client";
import { Get, Post } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Switch,
  Checkbox,
  Spinner,
} from "@nextui-org/react";
import Icon from "../icon";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "../dropdown/dropdown";
import { addToast } from "@heroui/toast";
import Organizationdropdown from "../organizationDropdown/organization-dropdown";

type Role = {
  name: string;
  permissions: string[];
  id: number;
};

type User = {
  organizationId: number;
  firstname: string;
  name: string;
  profileImage: string | null;
  lastname: string;
  phoneNumber: string;
  password: string;
  role: Role;
  nationalCode: string | null;
  personnelCode: string | null;
  isDeleted: boolean;
  id: number;
};

const EmployeesList = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [orgList, setOrgList] = useState([]);
  const [roleList, setRoleList] = useState<any[]>([]);
  const [teamList, setTeamList] = useState([] as any);
  const [teamId, setTeamId] = useState<null | number>(null);
  const [orgId, setOrgId] = useState<null | number>(null);
  const [shiftList, setShiftList] = useState([]);
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const locale = useLocale();
  const [currentLocale, setCurrentLocale] = useState<string>();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  const getUsersList = async () => {
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
    try {
      setIsLoading(true);
      const res = await Get(`/users`, {
        headers: {
          "Accept-Language": currentLocale,
        },
      });
      if (res.status === 200) {
        setUsersList(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  const getOranizationList = async () => {
    try {
      const res = await Get("/organization/admin/organizations", {
        headers: {
          "Accept-Language": currentLocale,
        },
      });
      if (res.status === 200) {
        setOrgList(
          res.data.map((el: any) => ({
            key: el.id,
            label: el.name,
          }))
        );
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
          res.data.map((el: any) => ({ key: el.id, label: el.name }))
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
          <div className="flex items-center gap-2">
            {/* <Button
              className="bg-blue-500 text-white"
              onPress={() => router.push(`/employees/userId?id=${record.id}`)}
            >
              {t("global.employee.details")}
            </Button> */}
            <Button
              color="secondary"
              onPress={() => router.push(`/reports/userId?id=${record.id}`)}
            >
              {t("global.employee.reports")}
              <Icon name="flag-triangle-right"></Icon>
            </Button>
          </div>
        );
      },
    },
  ];

  const onSubmit = async (data: any) => {
    const phoneNumber = `+98${data.phoneNumber}`;
    const settings = {
      salary: +data.salary,
      needToLocation: data.needToLocation,
      shiftId: shiftId,
      teamId: +data.teamId,
    };
    delete data.salary;
    delete data.teamId;
    delete data.needToLocation;
    delete data.shiftId;

    const params = {
      ...data,
      settings,
      phoneNumber,
      role: Number(data.role),
      organizationId: Number(data.organizationId),
    }; //  ********  this item must be send  !!!!!!

    try {
      const res = await Post(`users`, {
        ...params,
      });
      if (res.status === 201) {
        onClose();
        getUsersList();
      }
    } catch (error: any) {
      const messages = error?.response?.data.message;
      messages.forEach((message: string) => {
        addToast({ title: message });
      });
    }
  };

  const getTeam = async () => {
    try {
      if (teamId) {
        const res = await Get(`organization/${teamId}/teams`, {
          headers: {
            "Accept-Language": locale,
          },
        });
        if (res.status === 200) {
          setTeamList(
            res.data.map((el: any) => ({
              key: el.id,
              label: el.title,
            }))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUsersList();
    getOranizationList();
    getRoleList();
  }, []);

  useEffect(() => {
    getShifts();
  }, [orgId]);

  useEffect(() => {
    getTeam();
  }, [teamId]);

  return (
    <div className="w-full flex flex-col items-center ">
      <div className="flex w-full p-3">
        <Button color="default" onPress={() => onOpen()}>
          <Icon name="user-round-plus"></Icon>
          {t("global.employee.createUser")}
        </Button>
      </div>

      <div>
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          className="w-full"
          size="4xl"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    {t("global.employee.createUser")}
                  </ModalHeader>
                  <ModalBody>
                    <div className="grid grid-cols-3 justify-between items-center gap-2 flex-col md:flex-row">
                      <Input
                        {...register("name", {
                          required: t("global.auth.formError.required"),
                        })}
                        label={t("global.employee.create.name")}
                        isInvalid={!!errors.name}
                        errorMessage={errors.name?.message as string}
                      ></Input>

                      <Input
                        {...register("lastname", {
                          required: t("global.auth.formError.required"),
                        })}
                        label={t("global.employee.create.lastname")}
                        isInvalid={!!errors.lastname}
                        errorMessage={errors.lastname?.message as string}
                      ></Input>
                      <Input
                        {...register("nationalCode", {
                          required: t("global.auth.formError.required"),
                        })}
                        label={t("global.employee.create.nationalCode")}
                        isInvalid={!!errors.nationalCode}
                        errorMessage={errors.nationalCode?.message as string}
                      ></Input>
                    </div>
                    <div className="grid grid-cols-3 justify-between items-center gap-2">
                      <Input
                        {...register("phoneNumber", {
                          required: t("global.auth.formError.required"),
                        })}
                        label={t("global.employee.create.phoneNumber")}
                        isInvalid={!!errors.phoneNumber}
                        errorMessage={errors.phoneNumber?.message as string}
                      ></Input>
                      <Input
                        {...register("personnelCode", {
                          required: t("global.auth.formError.required"),
                        })}
                        label={t("global.employee.create.personnelCode")}
                        isInvalid={!!errors.personnelCode}
                        errorMessage={errors.personnelCode?.message as string}
                      ></Input>
                      <Input
                        {...register("firstname", {
                          required: t("global.auth.formError.required"),
                        })}
                        label={t("global.employee.create.firstname")}
                        isInvalid={!!errors.firstname}
                        errorMessage={errors.firstname?.message as string}
                      ></Input>
                    </div>
                    <div className="grid grid-cols-3 justify-between items-center gap-2 ">
                      <div className="flex grow-0">
                        <Input
                          {...register("password", {
                            required: t("global.auth.formError.required"),
                          })}
                          label={t("global.employee.create.password")}
                          isInvalid={!!errors.password}
                          errorMessage={errors.password?.message as string}
                        ></Input>
                      </div>
                      <div className="flex grow-0">
                        <Input
                          {...register("salary", {
                            required: t("global.auth.formError.required"),
                          })}
                          label={t("global.employee.create.settings.salary")}
                          isInvalid={!!errors.password}
                          errorMessage={errors.password?.message as string}
                        ></Input>
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
                                const numericVal = Number(val);
                                setTeamId(numericVal);
                                setOrgId(numericVal);
                                field.onChange(numericVal);
                              }}
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
                          {t("global.employee.create.shift")}
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
                                setShiftId(numericVal);
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
                          {t("global.employee.create.team")}
                        </span>
                        <Controller
                          control={control}
                          name="teamId"
                          render={({ field }) => (
                            <CustomDropdown
                              disabled={orgList.length === 0}
                              dropdownItems={teamList}
                              onChange={field.onChange}
                              selectedValue={field.value}
                            />
                          )}
                        />
                        {errors.organizationId && (
                          <span className="text-red-500 text-sm">
                            {errors?.organizationId?.message as any}
                          </span>
                        )}
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
                              selectedValue={field.value}
                            />
                          )}
                        />
                        {errors.role && (
                          <span className="text-red-500 text-sm">
                            {errors.role.message as any}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex  items-center gap-1">
                      <span>
                        {t("global.employee.create.settings.needToLocation")}
                      </span>
                      <Controller
                        control={control}
                        name="needToLocation"
                        defaultValue={false}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            // isSelected={false}
                            onChange={(checked) => field.onChange(checked)}
                          />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-3 justify-between items-center gap-2">
                      <div className="flex  items-center gap-1">
                        {/* <span>{t("global.employee.create.active")}</span> */}
                        {/* <Controller
                          control={control}
                          name="isActive"
                          defaultValue={false}
                          render={({ field }) => (
                            <Switch
                              {...field}
                              aria-label="Automatic updates"
                              isSelected={field.value}
                              onChange={(checked) => field.onChange(checked)}
                            />
                          )}
                        /> */}
                      </div>
                      {/* <div>
                        <Input type="file"></Input>
                      </div> */}
                    </div>
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      {t("global.employee.cancel")}
                    </Button>
                    <Button color="primary" type="submit">
                      {t("global.employee.createUser")}
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </form>
        </Modal>
      </div>
      {isLoading ? (
        <Spinner
          className=" mt-[30vh]"
          classNames={{ label: "text-foreground " }}
          label={t("global.loading")}
        />
      ) : (
        <ReusableTable
          columns={tableColumns}
          tableData={usersList}
        ></ReusableTable>
      )}
    </div>
  );
};

export default EmployeesList;
