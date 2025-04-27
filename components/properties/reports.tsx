"use client";
import { Get, Post } from "@/lib/axios";
import { useLocale, useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import ReusableTable from "../reusabelTable/table";
import formatDate from "@/helpers/dateConverter";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import CustomDropdown from "../dropdown/dropdown";
import { debounce } from "@/utils/debounce";
import { addToast } from "@heroui/toast";
import { PropertyReport } from "@/helpers/types";

type Category = {
  key: string;
  label: string;
};
const PropertyReports = () => {
  const [reportList, setReportList] = useState<PropertyReport[]>([]);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [propertyId, setPropertyId] = useState<number | null>(null);
  const [reportItem, setReportItem] = useState<PropertyReport | null>(null);
  const [reportCode, setReportCode] = useState<string | null>(null);
  const [catid, setCatid] = useState<null | number>(null);
  const [status, setStatus] = useState<null | number>(null);
  const [changedStatus, setChangedStatus] = useState<null | string>(null);

  const [categoryIds, setCategoryIds] = useState<Category[]>([]);
  const locale = useLocale();
  const t = useTranslations();

  const statusOptions = [
    {
      key: "pending",
      label: t("global.reports.pending"),
    },
    {
      key: "repairing",
      label: t("global.reports.repairing"),
    },
    {
      key: "repaired",
      label: t("global.reports.repaired"),
    },
    {
      key: "broken",
      label: t("global.reports.broken"),
    },
  ];
  const getAllReports = async () => {
    let url;
    if (reportCode === null && catid === null && status === null) {
      url = `property-reports/all`;
    } else {
      url = `property-reports/all?code=${reportCode || ""}&categoryId=${
        catid || ""
      }&status=${status || ""}`;
    }
    try {
      setIsLoading(true);
      const res = await Get(url, {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200 || res.status === 201) {
        setReportList(res.data);
      }
    } catch (error) {
      throw new Error("failed to fetch");
    } finally {
      setIsModalLoading(false);
      setIsLoading(false);
    }
  };

  const getReportsById = async (id: number) => {
    if (!id) return;

    try {
      setIsModalLoading(true);
      const res = await Get(`property-reports/${id}`, {
        headers: {
          "Accept-Language": locale,
        },
      });
      if (res.status === 200 || res.status === 201) {
        setReportItem({
          ...res.data,
          property: res.data.property || {}, // Ensure property exists
        });
      }
    } catch (error) {
      throw new Error("failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIds = async () => {
    const res = await Get(`property-categories`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (res.status === 200 || res.status === 201) {
      setCategoryIds(
        res.data.map((el: any) => ({ key: el.id, label: el.title }))
      );
    }
  };

  useEffect(() => {
    getReportsById(propertyId!);
    getCategoryIds();
  }, [propertyId, isOpen]);

  useEffect(() => {
    getAllReports();
  }, [status, catid, reportCode]);

  const handleModalOpen = (id: number) => {
    setPropertyId(id);
    onOpen();
  };

  const handleCatId = (val: any) => {
    setCatid(val);
  };
  const handleStatus = (val: any) => {
    setStatus(val);
  };

  const debouncedSearch = debounce((val: string) => {
    setReportCode(val);
  }, 500);

  const handleStatusChange = async () => {
    if (!changedStatus) return;
    const reportId = reportItem?.id;
    const res = await Post(
      `property-reports/${reportId}/status`,
      {
        status: changedStatus,
      },
      {
        headers: {
          "Accept-Language": locale,
        },
      }
    );
    if (res.status === 200 || res.status === 201) {
      addToast({
        title: t("global.alert.success"),
        color: "success",
      });
      onClose();
    } else {
      addToast({
        title: t("global.alert.error"),
        color: "danger",
      });
    }
  };
  const handlesearch = (val: string) => {
    debouncedSearch(val);
  };
  const tableCols = [
    { name: t("global.porperty-reports.userId"), uid: "userId" },
    { name: t("global.porperty-reports.propertyId"), uid: "propertyId" },
    { name: t("global.porperty-reports.report"), uid: "report" },
    { name: t("global.porperty-reports.status"), uid: "status" },
    {
      name: t("global.porperty-reports.createdAt"),
      uid: "createdAt",
      render: (record: PropertyReport) => {
        const calandarTypes = locale === "en" ? "gregorian" : "jalali";
        return (
          <span>{formatDate(record.createdAt, locale, calandarTypes)} </span>
        );
      },
    },
    {
      name: t("global.porperty-reports.actions"),
      uid: "actions",
      render: (record: PropertyReport) => {
        return (
          <div className="flex gap-2">
            <Button
              className="text-blue-500 hover:text-blue-700"
              onPress={() => handleModalOpen(record.id)}
            >
              {t("global.porperty-reports.actions")}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-1">
      <div className="flex items-end gap-2 w-full justify-between p-2 ">
        <div className="flex items-center gap-2">
          <div>
            <p>{t("global.reports.category")}</p>
            <CustomDropdown
              dropdownItems={categoryIds}
              selectedValue={
                categoryIds.find((el: any) => el.key === catid)?.label
              }
              onChange={(val) => handleCatId(val)}
            ></CustomDropdown>
          </div>
          <div>
            <p>{t("global.reports.status")}</p>
            <CustomDropdown
              dropdownItems={statusOptions}
              selectedValue={
                categoryIds.find((el: any) => el.key === catid)?.label
              }
              onChange={(val) => handleStatus(val)}
            ></CustomDropdown>
          </div>
        </div>
        <div>
          <Input
            label={t("global.reports.reportCode")}
            onChange={(e) => handlesearch(e.target.value)}
          ></Input>
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("global.reports.reportAndDetail")}
              </ModalHeader>
              <ModalBody>
                <div>
                  <p>
                    <strong>Property Code:</strong> {reportItem?.property.code}
                  </p>
                  <p>
                    <strong>Brand:</strong> {reportItem?.property.brand}
                  </p>
                  <p>
                    <strong>Model:</strong> {reportItem?.property.model}
                  </p>
                  <p>
                    <strong>Category:</strong>{" "}
                    {reportItem?.property.category.title}
                  </p>
                  <p>
                    <strong>Report:</strong> {reportItem?.report}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {formatDate(
                      reportItem?.createdAt as any,
                      locale,
                      locale === "en" ? "gregorian" : "jalali"
                    )}
                  </p>
                  <div className="mt-4">
                    <label htmlFor="status">Change Status:</label>
                    <CustomDropdown
                      dropdownItems={statusOptions}
                      selectedValue={
                        statusOptions.find(
                          (option) => option.key === reportItem?.status
                        )?.label
                      }
                      onChange={(val) => {
                        setChangedStatus(val);
                      }}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    handleStatusChange();
                  }}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ReusableTable columns={tableCols} tableData={reportList}></ReusableTable>
      {isLoading && (
        <div className="flex flex-col items-center grow w-full h-full justify-center mt-auto">
          <Spinner></Spinner>
        </div>
      )}
    </div>
  );
};

export default PropertyReports;
