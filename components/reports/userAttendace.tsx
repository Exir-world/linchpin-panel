import React, { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useTranslations } from "next-intl";
import { Get } from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import ReusableTable from "../reusabelTable/table";
import { format as formatJalali, parseISO, toDate } from "date-fns-jalali";
import { format } from "date-fns";
import { Spinner } from "@nextui-org/react";

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

    return Object.keys(grouped).map((date) => {
      const entries = grouped[date];
      const times: TimeEntry[] = entries.map((entry) => {
        const checkIn = entry.checkIn ? new Date(entry.checkIn) : null;
        const checkOut = entry.checkOut ? new Date(entry.checkOut) : null;
        return {
          in: checkIn ? formatTimeToLocal(checkIn) : "-",
          out: checkOut ? formatTimeToLocal(checkOut) : "-",
        };
      });

      const totalDuration = entries.reduce((sum: number, entry) => {
        const checkIn = new Date(entry.checkIn);
        const checkOut = new Date(entry.checkOut);
        return sum + (checkOut.getTime() - checkIn.getTime());
      }, 0);

      const formattedDate = formatDateToJalali(date);

      return {
        date: formattedDate,
        duration: totalDuration,
        times,
      };
    });
  };

  const getUserAttendanceReport = async () => {
    if (!id) return;
    try {
      setIsLoading(true);

      const res = await Get(
        `attendance/admin/filter?userId=${id}&startDate=${startDate}&endDate=${endDate}`
      );
      console.log(res);
      if (res.status === 200) {
        const reports = groupByDate(res.data);

        setReportData(reports);
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
      render: (record: OutputData) => (
        <div className="flex flex-col gap-1">
          {record.times.map((el, idx) => (
            <div key={idx} className="flex justify-start gap-4">
              <span>{el.in}</span>
              <span>{el.out}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  useEffect(() => {
    getUserAttendanceReport();
  }, [startDate, endDate]);

  return (
    <div>
      <div className="flex items-center gap-3 pb-3">
        <div className="flex flex-col gap-1">
          <span>{t("global.reports.startDate")}</span>
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
          <span>{t("global.reports.endDate")}</span>
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
