"use client";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { ExportIcon } from "@/components/icons/accounts/export-icon";
import { useLocale, useTranslations } from "next-intl";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Get, Post } from "@/lib/axios";
import { User } from "@/helpers/types";
import { useRouter, useSearchParams } from "next/navigation";
import ReusableTable from "../reusabelTable/table";
import formatDate from "@/helpers/dateConverter";
import { useForm } from "react-hook-form";

interface RequestUser {
  id: number;
  name: string;
  phoneNumber: string;
  firstname: string;
  lastname: string;
  personnelCode: string | null;
  profileImage: string;
}
interface Request {
  id: number;
  type: string;
  status: string;
  description: string;
  adminComment: string | null;
  userId: number;
  startTime: string | null;
  endTime: string | null;
  reviewedById: number | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: RequestUser;
}
type ReqTypes = {
  requestId: number;
  title: string;
};
export const UserRequests = () => {
  // const [value, setValue] = useState<any>();
  const [userRequests, setUserRequests] = useState([]);
  const [requestTypes, setReqTypes] = useState([] as ReqTypes[]);
  const t = useTranslations("global.requests");
  const params = useSearchParams();
  const userId = params.get("id");
  const router = useRouter();
  const locale = useLocale();
  const [requestId, setRequestId] = useState<number | null>(null);
  const { handleSubmit, register, setValue } = useForm();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const calendarType = locale === "en" ? "gregorian" : "jalali";

  const getUsersRequests = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const res = await Get(`/requests?userId=${userId}`);
      console.log(res);
      if (res.status === 200) {
        setUserRequests(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestTypes = async () => {
    const res = await Get(`requests/request-types`, {
      headers: {
        "Accept-Language": locale,
      },
    });
    if (res.status == 200) {
      setReqTypes(res.data);
    }
    console.log(res);
  };

  useEffect(() => {
    getUsersRequests();
    getRequestTypes();
  }, []);

  // const handleRangeDate = (data: DateObject | any) => {
  //   if (data) {
  //     const persianDate = data.format("YYYY/MM/DD"); // e.g., "1404/01/19"

  //     const gregorianDate = data.convert().toDate();

  //     console.log("Persian Date:", persianDate);
  //     console.log("Gregorian Date:", gregorianDate);

  //     // Update state
  //     setValue(data);
  //   } else {
  //     console.log("No date selected");
  //   }
  // };

  const handleRequest = async (data: any) => {
    if (requestId === null) return;
    try {
      const res = await Post(
        `requests/review`,
        {
          ...data,
          requestId: requestId,
        },
        {
          headers: {
            "Accept-Language": locale || "en",
          },
        }
      );
      if (res.status === 201 || res.status === 200) {
        onClose();
        getUsersRequests();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handelAnswerRequest = (requestItem: Request) => {
    onOpen();
    setRequestId(requestItem.id);
  };
  const tableColumns = [
    {
      name: t("name"),
      uid: "user.name",
      // render: (r: PropertyRequest) => `${r.user.firstname} ${r.user.lastname}`,
    },
    {
      name: t("type"),
      uid: "type",
      render: (record: Request) => {
        return (
          <span>
            {
              requestTypes.find((item: any) => item.requestId === record.type)
                ?.title
            }
          </span>
        );
      },
    },
    {
      name: t("status"),
      uid: "status",
      render: (record: Request) => {
        const colorClass =
          record.status === "CANCELLED"
            ? "bg-[#6C757D]"
            : record.status === "PENDING"
            ? "bg-[#FFC107] "
            : record.status === "APPROVED"
            ? "bg-[#28A745]"
            : record.status === "REJECTED"
            ? "bg-[#DC3545]"
            : "bg-black";
        return (
          <div>
            <p
              className={`font-medium text-white rounded-full px-2 py-1 w-fit text-xs flex items-center text-center whitespace-nowrap ${colorClass}`}
            >
              {t(`filter.${record.status.toLowerCase()}`)}
            </p>
          </div>
        );
      },
    },
    {
      name: t("description"),
      uid: "description",
      render: (record: Request) => {
        return <div className="min-w-20">{record.description}</div>;
      },
    },
    {
      name: t("phoneNumber"),
      uid: "user.phoneNumber",
      render: (record: Request) => {
        return <span>{record.user.phoneNumber}</span>;
      },
    },
    // {
    //   name: t("adminComment"),
    //   uid: "adminComment",
    //   render: (r: Request) => r.adminComment ?? "—",
    // },
    // {
    //   name: t("startTime"),
    //   uid: "startTime",
    //   render: (r: Request) =>
    //     r.startTime ? formatDate(new Date(r.startTime)) : "—",
    // },
    // {
    //   name: t("endTime"),
    //   uid: "endTime",
    //   render: (r: Request) =>
    //     r.endTime ? formatDate(new Date(r.endTime)) : "—",
    // },
    // {
    //   name: t("reviewedBy"),
    //   uid: "reviewedById",
    //   render: (r: Request) => r.reviewedById ?? "—",
    // },
    // {
    //   name: t("reviewedAt"),
    //   uid: "reviewedAt",
    //   render: (r: Request) =>
    //     r.reviewedAt ? formatDate(new Date(r.reviewedAt)) : "—",
    // },
    {
      name: t("createdAt"),
      uid: "createdAt",
      render: (r: Request) => {
        return (
          <span>{formatDate(new Date(r.createdAt), locale, calendarType)}</span>
        );
      },
    },
    // {
    //   name: t("updatedAt"),
    //   uid: "updatedAt",
    //   render: (r: Request) => formatDate(new Date(r.updatedAt)),
    // },

    {
      name: t("actions"),
      uid: "actions",
      render: (r: Request) => (
        <Button color="secondary" onPress={() => handelAnswerRequest(r)}>
          {t("actions")}
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col gap-4 ">
      <div className="flex justify-between flex-wrap gap-4 items-center">
        {/* <div className="flex justify-between gap-3 w-full">
          <DatePicker
            value={value}
            onChange={(val) => handleRangeDate(val)}
            calendar={persian}
            locale={persian_fa}
            onOpenPickNewDate={false}
            placeholder={t("selectDate")}
            style={{
              width: "90%",
              padding: "18px 10px",
              textAlign: "center",
              borderRadius: "15px",
              border: "1px solid #ccc",
            }}
          />
          <div className="flex flex-row gap-3.5 flex-wrap">
            <Button color="primary" startContent={<ExportIcon />}>
              Export to Exell
            </Button>
          </div>
        </div> */}
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
      <div className="w-full flex justify-center">
        {isLoading && <Spinner label={t("loading")} />}
      </div>
      <ReusableTable
        columns={tableColumns}
        tableData={userRequests}
      ></ReusableTable>
    </div>
  );
};
