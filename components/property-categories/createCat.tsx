"use client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spacer,
  useDisclosure,
} from "@nextui-org/react";
import React from "react";
import Icon from "../icon";
import { useFieldArray, useForm } from "react-hook-form";
import { Post } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import { addToast } from "@heroui/toast";

type FormValues = {
  title: string;
  features: { value: string }[];
};

const CreateCategory = () => {
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const locale = useLocale();
  const t = useTranslations();
  const { control, register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: {
      title: "",
      features: [{ value: "" }], // start with one feature
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  const onSubmit = async (data: FormValues) => {
    // transform into API shape
    const payload = {
      title: data.title,
      features: data.features.map((f) => f.value).filter((x) => x), // filter to prevent to send empty array items
    };

    const res = await Post(`property-categories`, payload, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (res.status === 200 || res.status === 201) {
      onClose();
      addToast({
        title: t("global.alert.success"),
        color: "success",
      });
    } else {
      addToast({
        title: t("global.alert.error"),
        color: "danger",
      });
    }
  };

  return (
    <>
      <Button onPress={onOpen} color="primary">
        {t("global.category.createCat")}
        <Icon name="folder-plus" />
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <ModalHeader>{t("global.category.createCat")}</ModalHeader>
            <ModalBody>
              <Input
                {...register("title", { required: "Title is required" })}
                label={t("global.category.title")}
                fullWidth
              />
              <div className="w-full flex justify-end p-2">
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => append({ value: "" })}
                >
                  <Icon name="plus"></Icon>
                  {t("global.category.addFeature")}
                </Button>
              </div>

              <Spacer y={1} />

              <div className="flex flex-col  gap-2 w-full ">
                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-2 ">
                    <Input
                      label={t("global.category.feature")}
                      {...register(`features.${idx}.value` as const)}
                      fullWidth
                    />
                    <Button
                      onPress={() => remove(idx)}
                      // always keep at least one
                    >
                      {t("global.category.remove")}
                    </Button>
                  </div>
                ))}
              </div>

              {/* <Spacer y={1} /> */}
            </ModalBody>
            <ModalFooter>
              <Button type="submit">{t("global.category.create")}</Button>
              <Button variant="light" color="danger" onPress={() => onClose()}>
                {t("global.category.close")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default CreateCategory;
