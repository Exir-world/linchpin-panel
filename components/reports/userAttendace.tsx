import React, { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useLocale, useTranslations } from "next-intl";
import { Get, Patch, Post } from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import ReusableTable from "../reusabelTable/table";
import { format as formatJalali, parseISO, toDate } from "date-fns-jalali";
import { format, setDate } from "date-fns";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import Icon from "../icon";
import { addToast } from "@heroui/toast";
import { TimeInput } from "@heroui/date-input";
import { Time } from "@internationalized/date";

interface InputData {
  stops: any[];
  id: number;
  userId: number;
  checkIn: string;
  checkOut: string;
  lat: string;
  lng: string;
}

interface TimeEntry {
  in: string; // زمان ورود به فرمت HH:mm
  out: string; // زمان خروج به فرمت HH:mm
  inDate: string; // تاریخ ورود به فرمت YYYY-MM-DD
  outDate: string; // تاریخ خروج به فرمت YYYY-MM-DD
  attendanceId: number;
}

interface OutputData {
  date: string; // تاریخ به فرمت YYYY-MM-DD
  duration: number; // مدت زمان به میلی‌ثانیه
  times: TimeEntry[];
}

interface Role {
  id: number;
  name: string;
  permissions: any[]; // You can replace `any` with a more specific permission type if known
}

interface UserInfo {
  organizationId: number;
  firstname: string;
  name: string;
  profileImage: string | null;
  lastname: string;
  phoneNumber: string;
  password: string;
  role: Role;
  nationalCode: string | null;
  personnelCode: string | null;
  isDeleted: boolean;
  id: number;
}

const UserAttendace = () => {
  const t = useTranslations();
  const params = useSearchParams();
  const [startDate, setStartDate] = useState<Date | any>("");
  const [endDate, setEndDate] = useState<Date | any>("");
  const [reportData, setReportData] = useState([] as OutputData[]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();
  const [editedEntry, setEditedEntry] = useState<any>(null);
  const [editedExit, setEditedExit] = useState<any>(null);
  const [eachDayDate, setEachDayDate] = useState<any | Date>(null);
  const [useInfo, setUserInfo] = useState({} as UserInfo);
  const [excelLoading, setExcelLoading] = useState(false);
  // const [editRowInfo, setEditingRowInfo] = useState({
  //   attendanceId: null,
  //   inDate: "",
  //   outDate: "",
  // } as any);
  //
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [timePickersState, setTimePickersState] = useState<{
    attendanceId: number | null;
    inDate: string;
    outDate: string;
    in: string;
    out: string;
  }>({
    attendanceId: null,
    inDate: "",
    outDate: "",
    in: "",
    out: "",
  });

  //
  const locale = useLocale();
  const id = params.get("id");

  const formatDateToLocal = (date: Date): string => {
    return date.toLocaleDateString("en-CA"); // فرمت YYYY-MM-DD
  };
  // فرمت تاریخ به شمسی
  const formatDateToJalali = (date: Date | string): string => {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return formatJalali(parsedDate, "yyyy/MM/dd"); // فرمت شمسی
  };

  // فرمت زمان به محلی (HH:mm)
  const formatTimeToLocal = (date: Date | string): string => {
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    return format(parsedDate, "HH:mm"); // فرمت 24 ساعته
  };

  // تبدیل میلی‌ثانیه به ساعت و دقیقه
  const formatDuration = (duration: number): string => {
    // بررسی اینکه آیا ورودی به میلی‌ثانیه است یا خیر
    if (isNaN(duration) || duration < 0) {
      return "00:00"; // در صورتی که ورودی نادرست باشد، زمان 00:00 را باز می‌گردانیم
    }

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    // برگشت فرمت درست زمان با صفرهای پیش‌فرض
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const groupByDate = (data: InputData[]): OutputData[] => {
    const grouped = data.reduce((acc: { [key: string]: InputData[] }, item) => {
      const checkInDate = new Date(item.checkIn);
      const localDate = formatDateToLocal(checkInDate);
      if (!acc[localDate]) {
        acc[localDate] = [];
      }
      acc[localDate].push(item);
      return acc;
    }, {});

    return Object.keys(grouped)
      .map((date) => {
        // Filter out the stops
        const entries = grouped[date].filter(
          (item) => !item.stops || item.stops.length === 0
        );

        if (entries.length === 0) return null; // Skip if no valid entries

        // Create times array for all valid entries
        const times: TimeEntry[] = entries.map((entry) => {
          const checkIn = entry.checkIn ? new Date(entry.checkIn) : null;
          const checkOut = entry.checkOut ? new Date(entry.checkOut) : null;

          return {
            in: checkIn ? formatTimeToLocal(checkIn) : "-",
            out: checkOut ? formatTimeToLocal(checkOut) : "-",
            inDate: checkIn ? checkIn.toISOString() : "-",
            outDate: checkOut ? checkOut.toISOString() : "-",
            attendanceId: entry.id,
          };
        });

        // Sum durations of all valid entries
        const totalDuration = entries.reduce((acc, entry) => {
          const checkIn = entry.checkIn ? new Date(entry.checkIn) : null;
          const checkOut = entry.checkOut ? new Date(entry.checkOut) : null;

          if (
            checkIn &&
            checkOut &&
            !isNaN(checkIn.getTime()) &&
            !isNaN(checkOut.getTime())
          ) {
            // Make sure check-out is on the same date as check-in:
            const isSameDate =
              checkIn.getFullYear() === checkOut.getFullYear() &&
              checkIn.getMonth() === checkOut.getMonth() &&
              checkIn.getDate() === checkOut.getDate();

            // if (!isSameDate) {
            //   console.warn(
            //     `⚠️ Check-in and check-out are on different dates for entry ID ${entry.id}. Ignoring this duration.`
            //   );
            //   return acc; // skip this invalid duration
            // }

            return acc + (checkOut.getTime() - checkIn.getTime());
          }
          return acc;
        }, 0);

        const formattedDate = formatDateToJalali(date);

        return {
          date: formattedDate,
          duration: totalDuration,
          times,
        };
      })
      .filter((entry) => entry !== null) as OutputData[];
  };

  const getUserAttendanceReport = async () => {
    // اگر هیچ کدام از فیلدها پر نشده باشد، تابع را متوقف کن
    if (!id || !startDate || !endDate) return;
    try {
      setIsLoading(true);

      const res = await Get(
        `attendance/admin/filter?userId=${id}&startDate=${startDate}&endDate=${endDate}`
      );
      if (res.status === 200) {
        const reports = groupByDate(res.data);

        const reportsWithId = reports.map((report, index) => ({
          ...report,
          id: res.data[index].id, // اضافه کردن شناسه به هر گزارش
        }));

        setReportData([...reportsWithId]);
      }
    } catch (error) {
      throw new Error("failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDate = (date: DateObject | any) => {
    const gregorianDate = date.convert().toDate();
    setStartDate(new Date(gregorianDate).toISOString());
  };

  const handleEndDate = (date: DateObject | any) => {
    const gregorianDate = date.convert().toDate();
    setEndDate(new Date(gregorianDate).toISOString());
  };

  const handleExiteDate = (
    attendanceId: any,
    value: any,
    originalDateObj: any
  ) => {
    if (!value) return;

    const selectedTime = value.toDate();
    const baseDate = new Date(originalDateObj);

    if (isNaN(baseDate.getTime())) {
      console.error("⚠️ Invalid base date:", originalDateObj);
      // If the original date is "-", set the base date to the current date
      if (originalDateObj === "-") {
        const currentDate = new Date();
        baseDate.setFullYear(currentDate.getFullYear());
        baseDate.setMonth(currentDate.getMonth());
        baseDate.setDate(currentDate.getDate());
      } else {
        return;
      }
    }

    baseDate.setHours(selectedTime.getHours());
    baseDate.setMinutes(selectedTime.getMinutes());
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    const isoString = baseDate.toISOString();

    setTimePickersState((prev) => ({
      ...prev,
      attendanceId,
      checkOut: isoString,
    }));
  };

  const handleEntryDate = (
    attendanceId: any,
    value: any,
    originalDateObj: any
  ) => {
    if (!value) return;

    const selectedTime = value.toDate(); // این ساعت کاربره
    const baseDate = new Date(originalDateObj); // این باید یک Date واقعی باشه

    if (isNaN(baseDate.getTime())) {
      console.error("⚠️ Invalid base date:", originalDateObj);
      return;
    }

    baseDate.setHours(selectedTime.getHours());
    baseDate.setMinutes(selectedTime.getMinutes());
    baseDate.setSeconds(0);
    baseDate.setMilliseconds(0);

    const isoString = baseDate.toISOString();

    setTimePickersState((prev) => ({
      ...prev,
      attendanceId,
      checkIn: isoString,
    }));
  };

  const hanldeEditHours = async () => {
    // e.preventDefault();
    if (!editedEntry || !editedExit || !timePickersState.attendanceId) {
      addToast({
        color: "warning",
        title: t("global.alert.fieldRequired"),
      });
      return;
    }
    const params = {
      attendanceId: timePickersState.attendanceId,
      checkIn: editedEntry,
      checkOut: editedExit,
    };

    try {
      const res = await Patch(`attendance/admin`, params);
      if (res.status === 200 || res.status === 201) {
        onClose();
        getUserAttendanceReport();
        addToast({
          color: "success",
          title: t("global.alert.success"),
        });
      }
    } catch (error) {
      addToast({
        color: "danger",
        title: t("global.alert.error"),
      });
    }
  };

  const convertTimeObjectToISOString = (timeObj: any, baseDate: any) => {
    const date = new Date(eachDayDate);
    date.setHours(timeObj.hour);
    date.setMinutes(timeObj.minute);
    date.setSeconds(timeObj.second);
    date.setMilliseconds(timeObj.millisecond);

    return date.toISOString();
  };

  const handleEntryEdit = (val: any) => {
    //  تبدیل به فرمت ISO
    const entryTimefallBack = timePickersState.inDate || eachDayDate;
    // make sure there is a valid date
    const entryTime = convertTimeObjectToISOString(val, entryTimefallBack);
    setEditedEntry(entryTime);
  };

  const handleExitEdit = (val: any) => {
    const exitTimefallBack =
      timePickersState.outDate || eachDayDate || timePickersState.inDate;

    // محاسبه زمان خروج و تبدیل به فرمت ISO
    const exitTime = convertTimeObjectToISOString(val, exitTimefallBack);

    setEditedExit(exitTime);
  };

  const tableCols = [
    { name: t("global.attendance.date"), uid: "date" },
    {
      name: t("global.attendance.duration"),
      uid: "duration",
      render: (record: OutputData) => {
        return <span>{formatDuration(record.duration)}</span>;
      },
    },
    {
      name: t("global.attendance.attendance"),
      uid: "times",
      render: (record: OutputData) => {
        return (
          <div className="flex flex-col gap-1">
            {record.times.map((el, idx) => {
              const isEditing = editRowId === el.attendanceId;

              return (
                <div
                  key={el.attendanceId}
                  className="flex justify-between items-center gap-4"
                >
                  <div className="flex gap-5 items-center w-40 justify-between  p-1 ">
                    <div className="flex gap-5 items-center">
                      <Tooltip
                        content={t("global.attendance.entry")}
                        color="success"
                      >
                        <span>{el.in}</span>
                      </Tooltip>
                      <Tooltip
                        content={t("global.attendance.exit")}
                        color="secondary"
                      >
                        <span>{el.out}</span>
                      </Tooltip>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      isIconOnly
                      color="primary"
                      variant="flat"
                      onClick={() => {
                        setEachDayDate(el.inDate); // make sure there is atleast a valid date

                        onOpen();
                        setTimePickersState(el);
                      }}
                    >
                      <Icon name="square-pen"></Icon>
                      {/* {t("global.attendance.edit")} */}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  const getUserById = async () => {
    try {
      if (!id) {
        return;
      }
      const res = await Get(`users/${id}`);
      if (res.status === 200 || res.status === 201) {
        console.log(res.data, "**");
        setUserInfo(res.data);
      }
    } catch (error) {
      addToast({
        title: t("global.alert.error"),
        color: "danger",
      });
    }
  };

  const getExcelExport = async () => {
    const params = {
      startDate,
      endDate,
      holidaysDayCount: 0, // always 0
    };
    if (!startDate || !endDate) {
      addToast({
        title: t("global.attendance.emptyDateError"),
        color: "warning",
      });
      return;
    }
    try {
      setExcelLoading(true);
      const res = await Post(`attendance/admin/report`, params, {
        responseType: "blob",
      });
      if (res.status === 200) {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "attendance_report.xlsx");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        setExcelLoading(false);
      }
    } catch (error) {
      setExcelLoading(false);

      addToast({
        title: t("global.alert.error"),
        color: "danger",
      });
    } finally {
      setExcelLoading(false);
    }
  };

  useEffect(() => {
    getUserAttendanceReport();
  }, [startDate, endDate]);

  useEffect(() => {
    getUserById();
  }, [id]);

  return (
    <div>
      <div className="py-5 gap-1">
        <p className="text-xs text-gray-500">
          {t("global.attendance.employeeName")}
        </p>
        <p className="font-semibold ">
          {`${useInfo.firstname} ${useInfo.lastname}`}
        </p>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("global.attendance.editHours")}
              </ModalHeader>
              <ModalBody>
                <TimeInput
                  aria-label="Time-input"
                  label={t("global.attendance.entry")}
                  isRequired
                  onChange={(val) => {
                    handleEntryEdit(val);
                  }}
                ></TimeInput>
                <TimeInput
                  isRequired
                  label={t("global.attendance.exit")}
                  aria-label="Time-input"
                  onChange={(val) => {
                    handleExitEdit(val);
                  }}
                ></TimeInput>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("global.attendance.close")}
                </Button>
                <Button color="primary" onPress={hanldeEditHours}>
                  {t("global.attendance.confirm")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex items-end gap-3 pb-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm">{t("global.reports.startDate")}</span>
          <DatePicker
            value={startDate}
            onChange={(val) => handleStartDate(val)}
            calendar={persian}
            locale={persian_fa}
            onOpenPickNewDate={false}
            placeholder={t("global.reports.selectDate")}
            style={{
              width: "90%",
              padding: "18px 10px",
              textAlign: "center",
              borderRadius: "15px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm">{t("global.reports.endDate")}</span>
          <DatePicker
            value={endDate}
            onChange={(val) => handleEndDate(val)}
            calendar={persian}
            locale={persian_fa}
            onOpenPickNewDate={false}
            placeholder={t("global.reports.selectDate")}
            style={{
              width: "90%",
              padding: "18px 10px",
              textAlign: "center",
              borderRadius: "15px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div>
          <Button className="text-white bg-green-700 " onPress={getExcelExport}>
            {excelLoading ? (
              <span className="animate-spin">
                <Icon name="loader-circle" />
              </span>
            ) : (
              <div className="flex items-center gap-1">
                Excel
                <Icon name="sheet"></Icon>
              </div>
            )}
          </Button>
        </div>
      </div>
      {isLoading && (
        <div className="flex flex-col justify-center grow w-full items-center">
          <Spinner label={t("global.loading")} />
        </div>
      )}
      <ReusableTable columns={tableCols} tableData={reportData}></ReusableTable>
    </div>
  );
};

export default UserAttendace;
