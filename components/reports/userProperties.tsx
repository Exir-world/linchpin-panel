"use client";
import { Get, Post } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import formatDate from "@/helpers/dateConverter";

import Icon from "../icon";
import { addToast } from "@heroui/toast";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";

interface Category {
  id: number;
  title: string;
}
export interface Property {
  id: number;
  code: string;
  brand: string;
  model: string;
  description: string;
  status: string;
  createdAt: string; // ISO timestamp
  organizationId: number;
  departmentId: number | null;
  imageUrl: string | null;
  category: Category;
}
export interface PropertyItem {
  id: number;
  userId: number;
  propertyId: number;
  deliveredAt: string; // ISO timestamp
  property: Property;
  hasAlreadyReported: boolean;
}

const UserProperties = () => {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const t = useTranslations("global.properties");
  const params = useSearchParams();
  const [userProperties, setUserProperties] = useState([] as PropertyItem[]);
  const locale = useLocale();
  const [propertyList, setPropertyList] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]);
  const calType = locale == "en" ? "gregorian" : "jalali";
  const [isLoading, setIsLoading] = useState(false);

  const getUserProperties = async () => {
    const id = params.get("id");
    try {
      if (!id) return;
      setIsLoading(true);

      const res = await Get(`property-user/user-properties/${id}`, {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200 || res.status === 201) {
        setUserProperties(res.data || []);
      }
    } catch (error) {
      throw new Error("failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyList = async () => {
    const res = await Get(`properties?isAssigned=false`, {
      headers: {
        "Accept-Language": locale,
      },
    });

    if (res.status === 200 || res.status === 201) {
      setPropertyList(res.data || []);
    }
  };

  useEffect(() => {
    getUserProperties();
    getPropertyList();
  }, []);

  const handleUnassignProperty = async (property: PropertyItem) => {
    const userId = parseInt(params.get("id") as string);
    if (!userId || !property.propertyId) return; // check if userId and propertyId are valid
    const apiParams = {
      userId,
      propertyId: property.propertyId,
    };

    const res = await Post(`property-user/unassign`, apiParams);
    if (res.status === 200 || res.status === 201) {
      addToast({
        title: t("success"),
        color: "success",
      });
      getUserProperties();
    }
  };

  const tableCols = [
    // {
    //   name: t("imageUrl"),
    //   uid: "imageUrl",
    //   render: (record: PropertyItem) => {
    //     const url = record.property.imageUrl as string;
    //     return (
    //       // <Image
    //       //   className="border border-gray-200 rounded-xl"
    //       //   src={url}
    //       //   alt="property"
    //       //   width={80}
    //       //   height={80}
    //       // ></Image>
    //       <div></div>
    //     );
    //   },
    // },
    // { name: t("id"), uid: "id" },
    // { name: t("userId"), uid: "userId" },
    {
      name: t("code"),
      uid: "code",
      render: (record: PropertyItem) => {
        return <span>{record.property.code}</span>;
      },
    },

    {
      name: t("status"),
      uid: "status",
      render: (record: PropertyItem) => {
        return <span>{record.property.status}</span>;
      },
    },
    {
      name: t("title"),
      uid: "brand",
      render: (record: PropertyItem) => {
        return <span>{record.property.brand}</span>;
      },
    },
    {
      name: t("deliveredAt"),
      uid: "deliveredAt",
      render: (record: PropertyItem) => {
        return (
          <span>
            {formatDate(new Date(record.deliveredAt), locale, calType)}
          </span>
        );
      },
    },
    {
      name: t("actions"),
      uid: "",
      render: (record: PropertyItem) => {
        return (
          <Button color="danger" onPress={() => handleUnassignProperty(record)}>
            <Icon name="eraser"></Icon>
            {t("unAssign")}
          </Button>
        );
      },
    },
  ];

  const toggle = (id: number) => {
    setSelectedProperties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const assignPropertyToUser = async () => {
    const userId = parseInt(params.get("id") as string);

    const apiParams = {
      userId,
      propertyIds: selectedProperties,
    };

    const res = await Post(`property-user/assign`, apiParams);
    if (res.status === 201 || res.status === 200) {
      onClose();
      getUserProperties();
      addToast({
        title: t("success"),
        color: "success",
      });
    }
  };
  return (
    <div>
      <div className="w-full flex justify-end pb-2">
        <Button color="secondary" onPress={onOpen}>
          {t("assignProperty")}
          <Icon name="clipboard-pen-line"></Icon>
        </Button>
      </div>
      <div>
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          className="min-h-[40vh]"
          size="2xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {t("assignProperty")}
                </ModalHeader>
                <ModalBody>
                  <div className="max-h-full w-full flex flex-col gap-2 overflow-y-auto items-center p-2 justify-center grow ">
                    {propertyList.length > 0 ? (
                      propertyList.map((item: Property) => {
                        return (
                          <div
                            className={`
                            flex items-center w-full rounded-xl border border-gray-200 cursor-pointer
                            p-2 gap-2 hover:bg-gray-100 transition-all duration-200
                            ${
                              selectedProperties.includes(item.id)
                                ? "bg-gray-100"
                                : ""
                            }
                          `}
                            key={item.id}
                            onClick={() => toggle(item.id)}
                          >
                            <div className="flex gap-4 items-center">
                              <div>
                                <Checkbox
                                  color="secondary"
                                  isSelected={selectedProperties.includes(
                                    item.id
                                  )}
                                  onChange={() => toggle(item.id)}
                                ></Checkbox>
                              </div>
                              {item.imageUrl ? (
                                <Image
                                  alt="pic"
                                  src={item.imageUrl as string}
                                  width={60}
                                  height={60}
                                ></Image>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="flex items-start grow  justify-evenly ">
                              <div className="text-start  items-start flex">
                                <p className="text-start">
                                  {`${item.category.title} ${item.brand} ${item.model}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center">{t("noPropertytoAssign")}</p>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  {propertyList.length > 0 ? (
                    <>
                      <Button color="danger" variant="light" onPress={onClose}>
                        {t("close")}
                      </Button>
                      <Button color="primary" onPress={assignPropertyToUser}>
                        {t("assign")}
                      </Button>
                    </>
                  ) : (
                    <Button onPress={onClose} color="danger">
                      {t("close")}
                    </Button>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      <div>
        <div className="w-full flex justify-center">
          {isLoading && <Spinner label={t("loading")} />}
        </div>
        <ReusableTable
          columns={tableCols as any}
          tableData={userProperties}
        ></ReusableTable>
      </div>
    </div>
  );
};

export default UserProperties;
