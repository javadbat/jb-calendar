import { getYear as getJalaliYear, getMonth as getJalaliMonth } from "date-fns-jalali";
import { getYear, getMonth } from "date-fns";
const today = new Date();
export const getEmptyValue = () => ({
  year: null,
  month: null,
  day: null,
});

export const getDefaultCalendarData = () => ({
  jalali: {
    year: getJalaliYear(today),
    month: getJalaliMonth(today) + 1,
  },
  gregorian: {
    year: getYear(today),
    month: getMonth(today) + 1,
  },
});
