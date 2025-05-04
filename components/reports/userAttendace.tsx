import React, { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useLocale, useTranslations } from "next-intl";
import { Get, Patch } from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import ReusableTable from "../reusabelTable/table";
import { format as formatJalali, parseISO, toDate } from "date-fns-jalali";
import { format } from "date-fns";
import { Button, Spinner, Tooltip } from "@nextui-org/react";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import Icon from "../icon";
import { addToast } from "@heroui/toast";

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

const UserAttendace = () => {
  const t = useTranslations();
  const params = useSearchParams();
  const [startDate, setStartDate] = useState<Date | any>("");
  const [endDate, setEndDate] = useState<Date | any>("");
  const [reportData, setReportData] = useState([] as OutputData[]);
  const [isLoading, setIsLoading] = useState(false);
  //
  const [editRowId, setEditRowId] = useState<number | null>(null);
  const [timePickersState, setTimePickersState] = useState<{
    attendanceId: number | null;
    checkIn: string;
    checkOut: string;
  }>({
    attendanceId: null,
    checkIn: "",
    checkOut: "",
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
    console.log(duration);

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
          console.log(checkIn?.toISOString(), checkOut?.toISOString(), "hey");

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
    if (!id) return;
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

  const hanldeEditHours = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(timePickersState);
    try {
      const res = await Patch(`attendance/admin`, timePickersState);
      if (res.status === 200 || res.status === 201) {
        setEditRowId(null);
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
                  {isEditing ? (
                    <form
                      className="flex gap-3  items-end "
                      onSubmit={(e) => hanldeEditHours(e)}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="flex flex-col gap-2 w-32">
                          <p className="text-xs text-default-500">
                            {t("global.attendance.entry")}
                          </p>
                          <DatePicker
                            style={{ width: "100px" }}
                            disableDayPicker
                            format="hh:mm:ss A"
                            plugins={[<TimePicker key={"1"} />]}
                            onChange={(value) => {
                              handleEntryDate(
                                el.attendanceId,
                                value,
                                el.inDate
                              );
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 w-32">
                          <p className="text-xs">
                            {t("global.attendance.exit")}
                          </p>
                          <DatePicker
                            style={{ width: "100px" }}
                            disableDayPicker
                            format="hh:mm:ss A"
                            onChange={(value) => {
                              handleExiteDate(
                                el.attendanceId,
                                value,
                                el.inDate
                              );
                            }}
                            plugins={[<TimePicker key={"2"} />]}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Button type="submit" size="sm" color="success">
                          {t("global.attendance.save")}
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          color="danger"
                          onClick={() => setEditRowId(null)}
                        >
                          {t("global.attendance.cancel")}
                        </Button>
                      </div>
                    </form>
                  ) : (
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
                      <Button
                        type="button"
                        size="sm"
                        isIconOnly
                        color="primary"
                        variant="flat"
                        onClick={() => {
                          setEditRowId(el.attendanceId);
                          // clear the state before setting the new one
                          setTimePickersState({
                            attendanceId: el.attendanceId,
                            checkIn: "",
                            checkOut: "",
                          });
                        }}
                      >
                        <Icon name="square-pen"></Icon>
                        {/* {t("global.attendance.edit")} */}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    getUserAttendanceReport();
  }, [startDate, endDate]);

  return (
    <div>
      <div className="flex items-center gap-3 pb-3">
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
