"use client";
import { Get } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import formatDate from "@/helpers/dateConverter";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import Icon from "../icon";

export interface Property {
  id: number;
  title: string;
  code: string;
  status: string;
  createdAt: string;
  organizationId: number;
  departmentId: number;
  imageUrl: string | null;
}
export interface PropertyItem {
  id: number;
  userId: number;
  propertyId: number;
  deliveredAt: string;
  property: Property;
}

const UserProperties = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const t = useTranslations("global.properties");
  const params = useSearchParams();
  const [userProperties, setUserProperties] = useState([] as PropertyItem[]);
  const locale = useLocale();
  const [propertyList, setPropertyList] = useState();
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
    if (res.data === 200) {
      setPropertyList(res.data);
    }
  };

  useEffect(() => {
    getUserProperties();
    getPropertyList();
  }, []);

  const tableCols = [
    { name: t("id"), uid: "id" },
    // { name: t("userId"), uid: "userId" },
    { name: t("propertyId"), uid: "propertyId" },
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
  ];

  return (
    <div>
      <div className="w-full flex justify-end pb-2">
        <Button color="secondary" onPress={onOpen}>
          {t("assignProperty")}
          <Icon name="clipboard-pen-line"></Icon>
        </Button>
      </div>
      <div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="4xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Modal Title
                </ModalHeader>
                <ModalBody>
                  <p>
                    Magna exercitation reprehenderit magna aute tempor cupidatat
                    consequat elit dolor iusmod pariatur proident Lorem eiusmod
                    et. Culpa deserunt nostrud ad veniam.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Assign property
                  </Button>
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
