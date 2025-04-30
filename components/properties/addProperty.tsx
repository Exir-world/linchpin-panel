import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Icon from "../icon";
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

type OrgListTypes = {
  key: string;
  label: string;
};

type UploadRes = {
  originalName: string;
  url: string;
};

type FormValues = {
  code: string;
  brand: string;
  model: string;
  status: string;
  organizationId: string;
  departmentId: string;
  categoryId: string;
  description: string;
  features: Array<{
    featureId: number;
    value: string;
  }>;
};

const AddProperty = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [departmentList, setDepartmentList] = useState<any[]>([]);
  const [orgList, setOrgList] = useState<OrgListTypes[]>([]);
  const [orgId, setOrgId] = useState<number | null>(null);
  const [departemantId, setDepartemantId] = useState<number | null>(null);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [categoryResponse, setCategoryResponse] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [uploadSuccessRes, setUploadSuccessRes] = useState<UploadRes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("global.properties");
  const locale = useLocale();
  
  const { handleSubmit, register, control, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      organizationId: "3",
      categoryId: "1",
      status: PropertyStatusEnum.GOOD,
    }
  });

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
      addToast({
        title: t("error"),
        color: "danger",
      });
    }
  };


  const getCategories = async () => {
    try {
      const res = await Get("/property-categories", {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200) {
        const list = res.data.map((el: any) => ({
          key: String(el.id),
          label: el.title,
        }));
        setCategoryList(list);
        setCategoryResponse(res.data);
      }
    } catch (error) {
      addToast({
        title: t("error"),
        color: "danger",
      });
    }
  };

  const getDepartmentList = async () => {
    if (!orgId) return;
    try {
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
        const optional = { key: t("selectAll"), label: t("selectAll") };
        const data = [optional, ...departments];
        setDepartmentList(data as []);
      }
    } catch (error) {
      addToast({
        title: t("error"),
        color: "danger",
      });
    }
  };

  const statusDropdownItems = Object.values(PropertyStatusEnum).map((el) => ({
    key: el,
    label: el,
  }));

  useEffect(() => {
    getOranizationList();
    getCategories();
  }, []);

  useEffect(() => {
    getDepartmentList();
  }, [orgId]);

  const onsubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const numericOrgId = parseInt(data.organizationId);
      const departmentId = parseInt(data.departmentId);
      const categoryId = parseInt(data.categoryId);
      const imageUrl = uploadSuccessRes.length > 0 ? uploadSuccessRes[0].url : "";

      const res = await Post(`properties`, {
        ...data,
        organizationId: numericOrgId,
        departmentId: departmentId,
        categoryId,
        imageUrl: imageUrl,
      });

      if (res.status === 201 || res.status === 200) {
        addToast({
          title: t("success"),
          color: "success",
        });
        onClose();
      } else {
        addToast({
          title: t("error"),
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: t("error"),
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (data: UploadRes[]) => {
    setUploadSuccessRes(data);
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
              <ModalBody className="overflow-y-auto max-h-[60vh] w-full">
                <div className="flex flex-col items-center w-full gap-2">
                  <form
                    onSubmit={handleSubmit(onsubmit)}
                    className="flex flex-col items-center gap-2 w-full p-2"
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex-1">
                        <Input
                          label={t("code")}
                          {...register("code", { required: true })}
                          isInvalid={!!errors.code}
                          errorMessage={errors.code?.message as string}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          label={t("brand")}
                          {...register("brand", { required: true })}
                          isInvalid={!!errors.brand}
                          errorMessage={errors.brand?.message as string}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          label={t("model")}
                          {...register("model", { required: true })}
                          isInvalid={!!errors.model}
                          errorMessage={errors.model?.message as string}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 w-full p-3 justify-between">
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
                          defaultValue="1"
                          render={({ field }) => (
                            <CustomDropdown
                              dropdownItems={orgList}
                              onChange={(val) => {
                                field.onChange(val);
                                const numericVal = Number(val);
                                setOrgId(numericVal);
                              }}
                              selectedValue={
                                orgList.find((el: any) => el.key === orgId)?.label
                              }
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
                                setDepartemantId(parseInt(val));
                              }}
                              selectedValue={
                                departmentList.find(
                                  (el: any) => el.key === departemantId
                                )?.label
                              }
                            />
                          )}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p>{t("category")}</p>
                        <Controller
                          name="categoryId"
                          control={control}
                          defaultValue="1"
                          render={({ field }) => (
                            <CustomDropdown
                              dropdownItems={categoryList}
                              onChange={(val) => {
                                field.onChange(val);
                                const categoryId = typeof val === "string" ? parseInt(val) : val;
                                const category = categoryResponse.find(
                                  (el) => el.id === categoryId
                                );
                                setFeatures(category?.features || []);
                              }}
                              selectedValue={
                                categoryList.find((el: any) => el.key === field.value)?.label
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-start w-full px-2 grid-cols-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-4 w-full px-2">
                        {features.map((feature, idx) => (
                          <div key={feature.id} className="flex flex-col gap-1">
                            <input
                              type="hidden"
                              {...register(`features.${idx}.featureId`, {
                                setValueAs: (v) => Number(v),
                              })}
                              value={feature.id}
                            />
                            <Input
                              label={feature.title}
                              {...register(`features.${idx}.value` as const)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-full py-2 flex items-center gap-4 ">
                      <div className="">
                        <FileUploader autoUpload onUploadSuccess={(data) => handleUploadSuccess(data)}></FileUploader>
                      </div>
                      <div className="grow">
                        <Textarea
                          className="w-full "
                          {...register("description")}
                          label={t("adminComment")}
                        ></Textarea>
                      </div>
                    </div>
                  </form>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleSubmit(onsubmit)()}
                  isLoading={isLoading}
                >
                  {t("save")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AddProperty;
