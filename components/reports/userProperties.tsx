"use client";
import { Del, Get, Post } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import formatDate from "@/helpers/dateConverter";
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import Icon from "../icon";
import { addToast } from "@heroui/toast";

export interface Property {
  id: number;
  title: string;
  code: string;
  status: string;
  createdAt: string;
  organizationId: number;
  departmentId: number;
  imageUrl: string | null;
  userProperties: any[];
}
export interface PropertyItem {
  id: number;
  userId: number;
  propertyId: number;
  deliveredAt: string;
  property: Property;
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

  const getUserProperties = async () => {
    const id = params.get("id");
    if (!id) return;
    const res = await Get(`property-user/user-properties/${id}`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    setUserProperties(res.data);
  };

  const getPropertyList = async () => {
    const res = await Get(`properties?isAssigned=false`, {
      headers: {
        "Accept-Language": locale,
      },
    });

    if (res.status === 200 || res.status === 201) {
      setPropertyList(res.data);
    }
  };

  useEffect(() => {
    getUserProperties();
    getPropertyList();
  }, []);

  const handleUnassignProperty = async (property: PropertyItem) => {
    const userId = parseInt(params.get("id") as string);

    const apiParams = {
      userId,
      propertyId: property.id,
    };
    const res = await Post(`property-user/unassign`, apiParams);
    if (res.status === 200 || res.status === 201) {
      addToast({
        title: t("success"),
        color: "success",
      });
    }
  };

  const tableCols = [
    {
      name: t("imageUrl"),
      uid: "",
      render: (record: PropertyItem) => {
        const url = record.property.imageUrl as string;
        return (
          <Image
            className="border border-gray-200 rounded-xl"
            src={url}
            alt="property"
            width={80}
            height={80}
          ></Image>
          //   <span>hey</span>
        );
      },
    },
    // { name: t("id"), uid: "id" },
    // { name: t("userId"), uid: "userId" },
    {
      name: t("code"),
      uid: "",
      render: (record: PropertyItem) => {
        return <span>{record.property.code}</span>;
      },
    },

    {
      name: t("status"),
      uid: "",
      render: (record: PropertyItem) => {
        return <span>{record.property.status}</span>;
      },
    },
    {
      name: t("title"),
      uid: "",
      render: (record: PropertyItem) => {
        return <span>{record.property.title}</span>;
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
    console.log(selectedProperties);
  };

  const assignPropertyToUser = async () => {
    const userId = parseInt(params.get("id") as string);

    const apiParams = {
      userId: userId,
      propertyIds: selectedProperties,
    };

    const res = await Post(`property-user/assign`, apiParams);
    if (res.status === 201) {
      onClose();
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
          key={"hey"}
          className="min-h-[40vh] "
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
                            className={`flex items-center w-full rounded-xl border border-gray-200 p-2 gap-2 hover:bg-gray-100 transition-all duration-200 ${
                              selectedProperties.includes(item.id)
                                ? "bg-gray-100"
                                : ""
                            }`}
                            key={item.id}
                            onClick={() => toggle(item.id)}
                          >
                            <div className="flex gap-4 items-center">
                              <div className="">
                                <Checkbox
                                  color="secondary"
                                  isSelected={selectedProperties.includes(
                                    item.id
                                  )}
                                  onChange={() => toggle(item.id)}
                                ></Checkbox>
                              </div>
                              <Image
                                alt="pic"
                                src={item.imageUrl || ""}
                                width={60}
                                height={60}
                              ></Image>
                            </div>
                            <div className="flex items-start grow  justify-evenly ">
                              <div className="text-start  items-start">
                                {/* <p className="text-start">{t("title")}</p> */}
                                <p className="text-start">{item.title}</p>
                                <p className="text-start">{item.code}</p>
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
        <ReusableTable
          columns={tableCols as any}
          tableData={userProperties}
        ></ReusableTable>
      </div>
    </div>
  );
};

export default UserProperties;
