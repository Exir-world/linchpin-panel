import { format as formatGregorian } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { arSA } from "date-fns/locale/ar-SA";

import { format as formatJalali } from "date-fns-jalali";

function formatDate(
  dateInput: Date | string,              // Allow string or Date
  locale: string,
  calendar: "gregorian" | "jalali"
): string {
  // Convert string to Date if necessary
  let dateObject: Date;
  if (typeof dateInput === "string") {
    dateObject = new Date(dateInput);
  } else {
    dateObject = dateInput;
  }

  // Check for invalid or null date
  // 1) If date is null/undefined
  if (!dateObject) {
    return "Invalid date";
  }
  // 2) If date is an invalid Date object
  if (isNaN(dateObject.getTime())) {
    return "Invalid date";
  }

  // Now we have a valid Date object
  if (calendar === "jalali") {
    // purely Jalali, no built-in locale translation in date-fns-jalali
    return formatJalali(dateObject, "yyyy/MM/dd");
  } else {
    // Use official date-fns for Gregorian + locale
    let dateFnsLocale;
    if (locale === "ar") {
      dateFnsLocale = arSA;
    } else {
      dateFnsLocale = enUS; // fallback
    }
    return formatGregorian(dateObject, "yyyy/MM/dd", { locale: dateFnsLocale });
  }
}

export default formatDate;
