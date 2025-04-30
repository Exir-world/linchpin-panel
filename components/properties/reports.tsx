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
  Divider,
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
      url = `property-reports/all?code=${reportCode || ""}&categoryId=${catid || ""
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
      setIsModalLoading(false);
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
  }, [propertyId]);

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
      getAllReports() // refresh the data 
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
    {
      name: t("global.porperty-reports.propertyCode"),
      uid: "propertyCode",
      render: (record: PropertyReport) => (
        <span className="font-medium">{record.property?.code || "-"}</span>
      ),
    },
    {
      name: t("global.porperty-reports.report"),
      uid: "report",
      render: (record: PropertyReport) => (
        <span className="text-gray-600">{record.report}</span>
      ),
    },
    {
      name: t("global.porperty-reports.status"),
      uid: "status",
      render: (record: PropertyReport) => (
        <span className={`px-2 py-1 rounded-full text-sm ${record.status === "pending" ? "bg-yellow-100 text-yellow-800" :
            record.status === "repairing" ? "bg-blue-100 text-blue-800" :
              record.status === "repaired" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
          }`}>
          {t(`global.reports.${record.status}`)}
        </span>
      ),
    },
    {
      name: t("global.porperty-reports.createdAt"),
      uid: "createdAt",
      render: (record: PropertyReport) => {
        const calandarTypes = locale === "en" ? "gregorian" : "jalali";
        return (
          <span className="text-gray-600">
            {formatDate(record.createdAt, locale, calandarTypes)}
          </span>
        );
      },
    },
    {
      name: t("global.porperty-reports.actions"),
      uid: "actions",
      render: (record: PropertyReport) => (
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="light"
            onPress={() => handleModalOpen(record.id)}
            size="sm"
          >
            {t("global.porperty-reports.actions")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full p-4 bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t("global.reports.category")}
            </p>
            <CustomDropdown
              dropdownItems={categoryIds}
              selectedValue={categoryIds.find((el: any) => el.key === catid)?.label}
              onChange={(val) => handleCatId(val)}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t("global.reports.status")}
            </p>
            <CustomDropdown
              dropdownItems={statusOptions}
              selectedValue={statusOptions.find((el: any) => el.key === status)?.label}
              onChange={(val) => handleStatus(val)}
            />
          </div>
          <div className="flex-1">
            <Input
              label={t("global.reports.reportCode")}
              onChange={(e) => handlesearch(e.target.value)}
              placeholder={t("global.palceholder")}
              classNames={{
                label: "text-sm font-medium",
                input: "text-sm"
              }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : reportList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t("global.porperty-reports.noReports")}
        </div>
      ) : (
        <ReusableTable
          columns={tableCols}
          tableData={reportList}
        />
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="xl"
        classNames={{
          base: "max-w-2xl",
          header: "border-b border-gray-200",
          footer: "border-t border-gray-200",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">
                  {t("global.porperty-reports.reportDetails")}
                </h3>
                <p className="text-sm text-gray-500">
                  {reportItem?.property?.code}
                </p>
              </ModalHeader>
              <ModalBody>
                {isModalLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Spinner size="lg" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {t("global.porperty-reports.report")}
                      </h4>
                      <p className="text-gray-600">{reportItem?.report}</p>
                    </div>
                    <Divider />
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {t("global.porperty-reports.changeStatus")}
                      </h4>
                      <CustomDropdown
                        dropdownItems={statusOptions}
                        selectedValue={statusOptions.find((el: any) => el.key === changedStatus)?.label}
                        onChange={(val) => setChangedStatus(val)}
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("global.porperty-reports.close")}
                </Button>
                <Button
                  color="primary"
                  onPress={handleStatusChange}
                  isDisabled={!changedStatus}
                >
                  {t("global.porperty-reports.updateStatus")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default PropertyReports;
