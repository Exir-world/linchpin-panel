"use client";
import { Get, Patch, Post } from "@/lib/axios";
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
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import Icon from "../icon";
import { useForm } from "react-hook-form";
import { usePathname } from "next/navigation";
import ReusableTable from "../reusabelTable/table";

const OrganizationsList = () => {
  const t = useTranslations();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      description: "",
    },
    mode: "onChange",
  });
  const [currentLocale, setCurrentLocale] = useState<string>();
  const [data, setData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const pathname = usePathname();

  const getOranizationList = async () => {
    try {
      const res = await Get("/organization/admin/organizations");
      if (res.status === 200) {
        setData(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getOranizationList();
    };

    fetchData();

    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  const createOrg = async (data: any) => {
    console.log(data);

    try {
      const res = await Post("organization", data, {
        headers: {
          "Accept-Language": currentLocale,
        },
      });
      await getOranizationList();
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  const updateOrg = async (data: any) => {
    console.log(data);
    const params = {
      name: data.name,
      address: data.address,
      description: data.description,
    };
    try {
      const id = editData.id;
      if (!id) throw new Error("No organization ID for update");
      const res = await Patch(
        `organization/admin/organizations/${id}`,
        params,
        {
          headers: {
            "Accept-Language": currentLocale,
          },
        }
      );
      await getOranizationList(); // Refresh the list after updating
      setIsEditing(false); // Reset editing mode
      setEditData(null); // Clear edit data
      reset(); // Clear form
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (organization: any) => {
    setIsEditing(true); // Switch to editing mode
    setEditData(organization); // Set the data of the organization to be edited
    onOpen(); // Open the modal for editing
    reset({
      name: organization.name,
      address: organization.address,
      description: organization.description,
    });
  };

  const tableColumns = [
    { name: t("global.organizations.columns.name"), uid: "name" },
    { name: t("global.organizations.columns.id"), uid: "id" },
    { name: t("global.organizations.columns.creatorId"), uid: "creatorId" },
    { name: t("global.organizations.columns.address"), uid: "address" },
    { name: t("global.organizations.columns.description"), uid: "description" },
    {
      name: t("global.organizations.columns.actions"),
      uid: "actions",
      render: (record: any) => {
        return (
          <Button
            color="secondary"
            className="rounded-full"
            onPress={() => handleEdit(record)}
          >
            {t("global.organizations.edit")}
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-1">
        <div className="flex w-full justify-end p-3">
          <Button
            color="primary"
            onPress={() => {
              onOpen();
              setIsEditing(false);
              reset();
            }}
          >
            <Icon name="plus" />

            {t("global.organizations.create")}
          </Button>
        </div>
      </div>
      <div>
        <ReusableTable tableData={data} columns={tableColumns}></ReusableTable>
      </div>
      {/*  !!!  Modal for creating an organization  !!! */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <form onSubmit={handleSubmit(isEditing ? updateOrg : createOrg)}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {isEditing
                    ? t("global.organizations.edit-org")
                    : t("global.organizations.create-org")}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col items-center">
                    <Input
                      defaultValue={isEditing ? editData.name : ""}
                      label={t("global.organizations.name")}
                      {...register("name")}
                    ></Input>
                  </div>
                  <div className="flex flex-col items-center">
                    <Input
                      defaultValue={isEditing ? editData.address : ""}
                      label={t("global.organizations.address")}
                      {...register("address")}
                    ></Input>
                  </div>
                  <div className="flex flex-col items-center">
                    <Input
                      defaultValue={isEditing ? editData.description : ""}
                      label={t("global.organizations.description")}
                      {...register("description")}
                    ></Input>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose} type="submit">
                    {isEditing
                      ? t("global.organizations.update")
                      : t("global.organizations.create")}
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

export default OrganizationsList;
