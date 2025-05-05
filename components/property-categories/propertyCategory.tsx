"use client";
import { Del, Get, Patch, Post } from "@/lib/axios";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Icon from "../icon";
import CreateCategory from "./createCat";
import { addToast } from "@heroui/toast";
import useDir from "@/hooks/useDirection";

interface Feature {
  id: number;
  title: string;
}

interface Category {
  id: number;
  title: string;
  features: Feature[];
}

type FormValues = {
  title: string;
  id: string | number;
  features: {
    id: number;
    title: string;
  }[];
};

const PropertyCategory = () => {
  const [catList, setCatList] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [catId, setCatId] = useState<number | null>(null);
  const locale = useLocale();
  const t = useTranslations();
  const dir = useDir();
  const { control, register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { title: "", features: [] },
  });
  const { fields, replace, remove } = useFieldArray({
    control,
    name: "features",
    keyName: "fieldId",
  });

  const getCategories = async () => {
    setIsLoading(true);
    try {
      const res = await Get(`property-categories`, {
        headers: { "Accept-Language": locale },
      });
      if (res.status === 200 || res.status === 201) {
        setCatList(res.data);
      }
    } catch {
      console.error("failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, [locale]);

  const handleOpen = (cat: Category) => {
    setSelectedCat(cat);
    // مقداردهی اولیه فرم
    reset({
      title: cat.title,
      features: cat.features.map((f) => ({ id: f.id, title: f.title })),
    });
    setOpen(true);
    setCatId(cat.id);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedCat(null);
    reset(); // پاک کردن فرم
  };

  const onSubmit = async (data: FormValues) => {
    // payload شامل عنوان دسته و آرایه فیچرها
    const payload = {
      // id: selectedCat?.id,
      title: data.title,
      features: data.features.map(({ id, title }) => ({ id, title })),
    };
    const catId = selectedCat?.id;
    const res = await Patch(`property-categories/${catId}`, payload);
    console.log(res);
    if (res.status === 200 || res.status === 201) {
      addToast({
        title: t("global.alert.success"),
      });
      handleClose();
    }
  };

  const handleDelete = async () => {
    if (!catId) return;
    try {
      const res = await Del(`property-categories/${catId}`);
      if (res.status === 200 || res.status === 201) {
        addToast({
          title: t("global.alert.success"),
          color: "success",
        });
        setOpen(false);
        getCategories();
      } else {
        addToast({
          title: t("global.alert.error"),
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: t("global.alert.error"),
        color: "danger",
      });
      throw new Error("failed to delete");
    }
  };
  return (
    <div>
      {isLoading && (
        <div className="w-full flex flex-col justify-center items-center h-[100vh]">
          <Spinner color="primary" label={t("global.loading")}></Spinner>
        </div>
      )}
      <div className="w-full flex items-center p-3 ">
        {/* <Button onPress={() => setIsModalOpen(true)}>
          Create category
          <Icon name="folder-plus" />
        </Button> */}
        <CreateCategory onCreate={() => getCategories()}></CreateCategory>
      </div>
      <div className="flex flex-wrap gap-3 p-4 justify-center">
        {catList.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl bg-slate-50 flex flex-col items-center justify-between h-40 w-52 cursor-pointer"
            onClick={() => handleOpen(item)}
          >
            <div className="p-2 w-full flex justify-start">
              <p className="font-medium">{item.title}</p>
            </div>
            <div className="w-full p-2 flex justify-end">
              <Button
                size="sm"
                color="secondary"
                onPress={() => handleOpen(item)}
              >
                {t("global.category.showDetails")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        hideCloseButton
        isOpen={open}
        onOpenChange={setOpen}
        size="2xl"
        dir={dir}
      >
        <ModalContent>
          <ModalHeader>{t("global.category.modalTitle")} </ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody className="overflow-y-auto max-h-[60vh] space-y-4">
              {/* 1. ویرایش عنوان دسته */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  {t("global.category.categoryTitle")}
                </label>
                <Input
                  defaultValue={selectedCat?.title || ""}
                  {...register("title", { required: true })}
                  placeholder={t("global.palceholder")}
                  fullWidth
                />
              </div>

              {/* 2. جدول ویرایش فیچرها */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      {t("global.category.feature")}
                    </th>
                    {/* <th className="px-4 py-2 text-left">Title</th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fields.map((field, idx) => {
                    return (
                      <tr key={field.fieldId}>
                        <td className="px-4 py-2 flex items-cente gap-1">
                          <Input
                            {...register(`features.${idx}.title` as const, {
                              required: true,
                            })}
                            placeholder={t("global.palceholder")}
                            defaultValue={field.title}
                            fullWidth
                          />
                          <input
                            type="hidden"
                            {...register(`features.${idx}.id` as const, {
                              valueAsNumber: true,
                            })}
                            value={field.id}
                          />
                          <Button
                            className="my-auto"
                            onPress={() => remove(idx)}
                          >
                            <Icon name="minus"></Icon>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {fields.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-center text-gray-500"
                      >
                        {t("global.category.noFeaturesToEdit")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ModalBody>
            <ModalFooter className="flex justify-between w-full gap-2">
              <div className="w-full">
                <Button
                  color="danger"
                  variant="bordered"
                  onPress={handleDelete}
                >
                  {t("global.category.remove")}
                </Button>
              </div>

              <Button variant="bordered" color="danger" onPress={handleClose}>
                {t("global.category.cancel")}
              </Button>
              <Button type="submit" color="primary">
                {t("global.category.save")}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PropertyCategory;
