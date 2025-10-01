import {JBDictionary} from 'jb-core/i18n';
export type JBCalendarDictionary = {
  jalaliMonthList:string[]
  gregorianMonthList:string[]
  jalaliDayOfWeek:string[]
  gregorianDayOfWeek:string[],
  next:string,
  prev:string,
  showAllYear:string,
}

/**
 * dictionary of jb calendar input. it's already loaded with persian and english lang but you can also extend it with you apps other language or replace already exist language 
 * @example 
 * ```js
 * import {dictionary} from 'jb-calendar'
 * dictionary.setLanguage("fr", {
 *  requireMessage: (label:string| null)=>`${label} french require message`,
 * // other dictionary keys
 * });
 * ```
 */
export const dictionary = new JBDictionary<JBCalendarDictionary>({
  "fa":{
    jalaliMonthList:["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"],
    gregorianMonthList:["ژانویه","فوریه","مارس","می","ژوئن","ژوئیه","اوت","سپتامبر"],
    jalaliDayOfWeek:["ش", "ی", "د", "س", "چ", "پ", "ج"],
    gregorianDayOfWeek:["ی", "د", "س", "چ", "پ", "ج","ش"],
    next:"بعدی",
    prev:"قبلی",
    showAllYear:"نمایش همه سال‌ها"
  },
  "en":{
    jalaliMonthList:["Farvardin","Ordibehesht","Khordad","Tir","Mordad","Shahrivar","Mehr","Aban","Azar","Dey","Bahman","Esfand"],
    gregorianMonthList:[ "January","February","March","April","May","June","July","August","September","October","November","December",],
    jalaliDayOfWeek:["Sa","Su", "Mo", "Tu", "We", "Th", "Fr"],
    gregorianDayOfWeek:["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    next:"next",
    prev:"previous",
    showAllYear:"Show all years"
  }
});