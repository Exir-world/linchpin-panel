"use client";
import { PropertyDetail, CategoryFeature } from "@/helpers/types";
import { Del, Get, Put } from "@/lib/axios";
import {
  Button,
  Input,
  Textarea,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomDropdown from "../dropdown/dropdown";
import formatDate from "@/helpers/dateConverter";
import { addToast } from "@heroui/toast";
import FileUploader from "../imageuploader/uploader";
import Icon from "../icon";

enum PropertyStatusEnum {
  GOOD = "good",
  BROKEN = "broken",
}
type DropdownTypes = {
  label: string;
  key: string;
};
const PropertyDetails = () => {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const [propertyDetail, setPropertyDetail] = useState({} as PropertyDetail);
  const [editMode, setEditMode] = useState(false);
  const [orgList, setOrgList] = useState<DropdownTypes[]>([]);
  const [orgId, setOrgId] = useState<any>(null);
  const [departmentList, setDepartmentList] = useState([]);
  const [categoryList, setCategoryList] = useState<DropdownTypes[]>([]);
  const [categoryId, setCategoryId] = useState<null | number>(null);
  const [features, setFeatures] = useState<
    { featureId?: number; value: string }[]
  >([]);
  const [categoryFeatures, setCategoryFeatures] = useState<CategoryFeature[]>(
    []
  );
  const { handleSubmit, register, control, setValue } = useForm();
  const locale = useLocale();
  const params = useSearchParams();
  const t = useTranslations("global.properties");
  const calType = locale == "en" ? "gregorian" : "jalali";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

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
      setValue("brand", res.data.brand || "");
      setValue("model", res.data.model || "");
      setValue("description", res.data.description || "");
      setValue("status", res.data.status || PropertyStatusEnum.GOOD);
      setValue("categoryId", res.data.categoryId);
      setValue("organizationId", res.data.organizationId || "");
      setValue("departmentId", res.data.departmentId || "");
      setValue("imageUrl", res.data.imageUrl || "");
      // setFeatures(res.data.features || []);
    }
  };

  const getCategoryList = async () => {
    try {
      const res = await Get("/property-categories", {
        headers: {
          "Accept-Language": locale,
        },
      });

      if (res.status === 200) {
        setCategoryList(
          res.data.map((el: any) => ({
            key: +el.id,
            label: el.title,
          }))
        );
      }
    } catch (error) {
      console.log(error);
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
      setDepartmentList(departments);
    }
  };

  const statusDropdownItems = Object.keys(PropertyStatusEnum).map((el) => ({
    key: el.toLowerCase(),
    label: el,
  }));

  useEffect(() => {
    getPropertyById();
    getOranizationList();
    getCategoryList();
  }, []);

  useEffect(() => {
    getDepartmentList();
  }, [orgId]);

  useEffect(() => {
    if (categoryId) {
      getCategoryFeatures();
    }
  }, [categoryId]);

  const onSubmit = async (data: any) => {
    const id = params.get("id");
    if (!id) return;
    const apiParams = {
      brand: data.brand,
      model: data.model,
      code: data.code,
      description: data.description,
      status: data.status,
      categoryId: data.categoryId,
      organizationId: data.organizationId,
      departmentId: data.departmentId,
      imageUrl: data.imageUrl,
      features: features.map((f) => ({
        featureId: f.featureId,
        value: f.value,
      })),
    };

    const res = await Put(`properties/${id}`, { ...apiParams });
    if (res.status === 200 || res.status === 201) {
      addToast({
        title: t("success"),
        color: "success",
      });
      setEditMode(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const id = params.get("id");
    if (!id) return;

    try {
      setIsLoading(true);
      const res = await Del(`properties/${id}`, {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200 || res.status === 201) {
        addToast({
          title: t("success"),
          color: "success",
        });
        router.push("/properties");
      }
    } catch (error) {
      addToast({
        title: t("error"),
        color: "danger",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUploadSuccess = (data: any) => {
    setValue("imageUrl", data.url);
  };

  const addFeature = () => {
    setFeatures([...features, { value: "" }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], value };
    setFeatures(newFeatures);
  };

  const getCategoryFeatures = async () => {
    if (!categoryId) return;
    try {
      const res = await Get(
        `property-category-features?categoryId=${categoryId}`,
        {
          headers: {
            "Accept-Language": locale,
          },
        }
      );
      if (res.status === 200) {
        setCategoryFeatures(res.data);
        if (features.length > 0) {
          const combinedFeatures = res.data.map((cf: CategoryFeature) => {
            const existingFeature = features.find((f) => f.featureId === cf.id);
            return existingFeature || { featureId: cf.id, value: cf.title };
          });
          setFeatures(combinedFeatures);
        } else {
          setFeatures(
            res.data.map((cf: CategoryFeature) => ({
              featureId: cf.id,
              value: cf.title,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error fetching category features:", error);
    }
  };

  return (
    <div className="w-full p-4">
      <div className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
        <div>
          <Button
            color="secondary"
            variant={editMode ? "bordered" : "solid"}
            onPress={() => {
              setEditMode(!editMode);
            }}
          >
            <Icon name="file-cog"></Icon>
            {editMode ? t("show") : t("edit")}
          </Button>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-sm font-medium text-gray-700">
            {t("brand")}: {propertyDetail.brand}
          </p>
          <p className="text-sm text-gray-500">
            {t("createdAt")}:
            {formatDate(propertyDetail.createdAt, locale, calType)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col">
            <Controller
              name="brand"
              control={control}
              render={({ field }) => (
                <Input
                  readOnly={!editMode}
                  color={editMode ? "primary" : "default"}
                  label={t("brand")}
                  {...field}
                  classNames={{
                    input: "text-sm",
                    label: "text-sm font-medium",
                  }}
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <Controller
              name="model"
              control={control}
              render={({ field }) => (
                <Input
                  readOnly={!editMode}
                  color={editMode ? "primary" : "default"}
                  label={t("model")}
                  {...field}
                  classNames={{
                    input: "text-sm",
                    label: "text-sm font-medium",
                  }}
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <Controller
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  readOnly={!editMode}
                  color={editMode ? "primary" : "default"}
                  label={t("code")}
                  {...field}
                  classNames={{
                    input: "text-sm",
                    label: "text-sm font-medium",
                  }}
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700">{t("status")}</p>
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

          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700">
              {t("categoryId")}
            </p>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <CustomDropdown
                  dropdownItems={categoryList}
                  onChange={(val) => {
                    field.onChange(Number(val));
                    setCategoryId(Number(val));
                  }}
                  selectedValue={
                    categoryList.find((el) => el.key === field.value)?.label
                  }
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700">
              {t("organizationId")}
            </p>
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
                  selectedValue={
                    orgList.find((el: any) => el.key === field.value)?.label
                  }
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-700">
              {t("departmentId")}
            </p>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <CustomDropdown
                  dropdownItems={departmentList}
                  onChange={(val) => {
                    field.onChange(Number(val));
                  }}
                  selectedValue={field.value}
                />
              )}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              {t("image")}
            </label>
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              autoUpload={true}
            />
          </div>
        </div>

        <div className="mt-8">
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                readOnly={!editMode}
                color={editMode ? "primary" : "default"}
                label={t("description")}
                {...field}
                className="w-full"
                classNames={{
                  input: "text-sm",
                  label: "text-sm font-medium",
                }}
              />
            )}
          />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-gray-700">
              {features.length > 0 && t("features")}
            </label>
            {editMode && categoryFeatures.length > 0 && (
              <Button
                type="button"
                color="primary"
                variant="light"
                onClick={addFeature}
                size="sm"
              >
                {t("addFeature")}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  readOnly={!editMode}
                  color={editMode ? "primary" : "default"}
                  value={feature.value}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder={t("featureValue")}
                  className="flex-1"
                  classNames={{
                    input: "text-sm",
                    label: "text-sm font-medium",
                  }}
                />
                {editMode && (
                  <Button
                    type="button"
                    color="danger"
                    variant="light"
                    onClick={() => removeFeature(index)}
                    size="sm"
                  >
                    {t("delete")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {editMode && (
          <div className="flex justify-evenly mt-16 px-3">
            <Button
              onPress={handleDeleteClick}
              color="danger"
              type="button"
              isLoading={isLoading}
            >
              {t("delete")}
            </Button>
            <Button type="submit" color="primary" size="md">
              {t("save")}
            </Button>
          </div>
        )}
      </form>

      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        size="sm"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("deleteConfirmation")}
              </ModalHeader>
              <ModalBody>
                <p>{t("deleteConfirmationMessage")}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("cancel")}
                </Button>
                <Button
                  color="primary"
                  onPress={handleDeleteConfirm}
                  isLoading={isLoading}
                >
                  {t("confirm")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PropertyDetails;
