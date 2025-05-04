"use client";
import formatDate from "@/helpers/dateConverter";
import { RequestItem } from "@/helpers/types";
import { Get, Post } from "@/lib/axios";
import {
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const ReqDetails = () => {
  const params = useSearchParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const { handleSubmit, register, setValue } = useForm();
  const [requestItem, setRequestItem] = useState({} as RequestItem);
  const locale = useLocale();
  const [reqTypes, setReqTypes] = useState<any>([]);
  const cal = locale === "fa" ? "jalali" : "gregorian";
  const t = useTranslations("global.requests");

  const getRequestById = async () => {
    const id = params.get("id");
    if (!id) return;
    try {
      const res = await Get(`requests/${id}`, {
        headers: {
          "Accept-Language": locale || "en",
        },
      });
      if (res.status === 200) {
        setRequestItem(res.data);
      }
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const getRequestTypes = async () => {
    try {
      const res = await Get(`requests/request-types`, {
        headers: {
          "Accept-Language": locale,
        },
      });
      setReqTypes(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getRequestById();
    getRequestTypes();
  }, [params]);

  const handleRequest = async (data: any) => {
    const id = params.get("id");
    if (!id) return;
    try {
      const res = await Post(
        `requests/review`,
        {
          ...data,
          requestId: Number(id),
        },
        {
          headers: {
            "Accept-Language": locale || "en",
          },
        }
      );
      if (res.status === 201) {
        onClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full ">
      <div className="flex w-full items-center p-4">
        <Button color="secondary" onPress={onOpen}>
          {t("actions")}
        </Button>
      </div>

      <div className="flex flex-col items-center w-full gap-2 p-4 ">
        <div className="grid md:grid-cols-3 items-center justify-center w-full gap-4 p-3 border rounded-md shadow-sm">
          <div className="flex flex-col gap-2">
            <p>{t("adminComment")}</p>
            <p>{requestItem.adminComment}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p>{t("description")}</p>
            <p>{requestItem.description}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p>{t("name")}</p>
            <p>
              {requestItem?.user?.firstname} {requestItem?.user?.lastname}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 justify-center items-center w-full gap-4 p-3 border rounded-md shadow-sm">
          <div className="flex flex-col gap-2">
            <p>{t("createdAt")}</p>
            <p>{formatDate(requestItem.createdAt as any, locale, cal)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p>{t("startTime")}</p>
            <p>{formatDate(requestItem.startTime as any, locale, cal)}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p>{t("endTime")}</p>
            <p>{formatDate(requestItem.endTime as any, locale, cal)}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 justify-center items-center w-full gap-4 p-3 border rounded-md shadow-sm">
          <div className="flex flex-col gap-2">
            <p>{t("type")}</p>
            <p>
              {
                reqTypes.find((el: any) => el.requestId === requestItem.type)
                  ?.title
              }
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p>{t("status")}</p>
            <span
              className={`${
                requestItem.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : requestItem.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : requestItem.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : requestItem.status === "CANCELLED"
                  ? "bg-gray-100 text-gray-800 "
                  : ""
              } px-2 py-1  text-sm font-semibold rounded-full w-fit text-center`}
            >
              {t(`filter.${requestItem.status?.toLowerCase() || ""}`)}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p>{t("reviewedById")}</p>
            <p>{formatDate(requestItem.reviewedAt as any, locale, cal)}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 justify-center items-center w-full gap-4 p-3 border rounded-md shadow-sm">
          <div className="flex flex-col gap-2">
            <p>{t("personnelCode")}</p>
            <p>{requestItem?.user?.personnelCode}</p>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        placement="top-center"
        onOpenChange={onOpenChange}
        size="2xl"
      >
        <form onSubmit={handleSubmit(handleRequest)}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {t("checkRequest")}
                </ModalHeader>
                <ModalBody>
                  <Textarea
                    label={t("adminComment")}
                    {...register("adminComment", { required: true })}
                  ></Textarea>
                  <input type="hidden" {...register("action")} />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    type="submit"
                    onClick={() => setValue("action", "REJECT")}
                  >
                    {t("reject")}
                  </Button>
                  <Button
                    color="primary"
                    type="submit"
                    onClick={() => setValue("action", "APPROVE")}
                  >
                    {t("approve")}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </form>
      </Modal>
    </div>
  );
};

export default ReqDetails;
