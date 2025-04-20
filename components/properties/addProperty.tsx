import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Icon from "../icon";
import PhotoUploader from "../imageuploader/uploader";
import FileUploader from "../imageuploader/uploader";
import { Get, Post } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "../dropdown/dropdown";
import { addToast } from "@heroui/toast";

enum PropertyStatusEnum {
  GOOD = "good",
  BROKEN = "broken",
}

const AddProperty = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [departmentList, setDepartmentList] = useState([]);
  const [orgList, setOrgList] = useState([]);
  const [orgId, setOrgId] = useState<number | null>(null);
  const t = useTranslations("global.properties");
  const locale = useLocale();
  const { handleSubmit, register, control, setValue } = useForm();

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

  const statusDropdownItems = Object.values(PropertyStatusEnum).map((el) => ({
    key: el,
    label: el,
  }));

  useEffect(() => {
    getOranizationList();
  }, []);

  useEffect(() => {
    getDepartmentList();
  }, [orgId]);

  const onsubmit = async (data: any) => {
    const numericOrgId = parseInt(data.organizationId);
    const departmentId = parseInt(data.departmentId);

    const res = await Post(`properties`, {
      ...data,
      organizationId: numericOrgId,
      departmentId: departmentId,
      imageUrl: "",
    });
    console.log(res);
    if (res.status === 201 || res.status === 200) {
      addToast({
        title: t("success"),
        color: "success",
      });
    } else {
      addToast({
        title: t("error"),
        color: "danger",
      });
    }
  };

  return (
    <div>
      <Button color="secondary" onPress={onOpen}>
        {t("addnewPropery")}
        <Icon name="file-plus-2"></Icon>
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("addPropety")}
              </ModalHeader>
              <ModalBody className="overflow-y-auto max-h-[60vh]  w-full">
                <div className=" items-center w-full grid grid-cols-3 gap-2">
                  <div className=" col-span-2 ">
                    <form
                      onSubmit={handleSubmit(onsubmit)}
                      className="flex flex-col items-center gap-2"
                    >
                      <Input label="Title" {...register("title")}></Input>
                      <Input label="Code" {...register("code")}></Input>
                      <div className="grid grid-cols-3 gap-5 w-full py-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">{t("status")}</p>
                          <Controller
                            name="status"
                            control={control}
                            defaultValue={statusDropdownItems[0].key}
                            render={({ field }) => (
                              <CustomDropdown
                                dropdownItems={statusDropdownItems}
                                onChange={(val) => {
                                  field.onChange(val);
                                }}
                                selectedValue={field.value || "GOOD"}
                              />
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">{t("organizationId")}</p>
                          <Controller
                            name="organizationId"
                            control={control}
                            render={({ field }) => (
                              <CustomDropdown
                                dropdownItems={orgList}
                                onChange={(val) => {
                                  field.onChange(val);
                                  const numericVal = Number(val);
                                  setOrgId(numericVal);
                                }}
                                selectedValue={field.value}
                              />
                            )}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">{t("departmentId")}</p>
                          <Controller
                            name="departmentId"
                            control={control}
                            render={({ field }) => (
                              <CustomDropdown
                                dropdownItems={departmentList}
                                onChange={(val) => {
                                  field.onChange(val);
                                }}
                                selectedValue={field.value}
                              />
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 py-5">
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          {t("close")}
                        </Button>
                        <Button color="primary" type="submit">
                          {t("addnewPropery")}
                        </Button>
                      </div>
                    </form>
                  </div>
                  <div className="grid-cols-1  w-full justify-center flex">
                    <FileUploader destinationUrl=""></FileUploader>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddProperty;
