import { Dayjs } from "dayjs";

/* eslint-disable @typescript-eslint/no-namespace */
export type JBCalendarValue = {
    day: number | null;
    month: number | null;
    year: number | null;
}
export type JBCalendarElements = {
    selectionSections: {
        day: HTMLDivElement;
        month: HTMLDivElement;
        year: HTMLDivElement;
    },
    monthDayWrapper: {
        current: HTMLDivElement;
        prev: HTMLDivElement;
        next: HTMLDivElement;
    },
    yearsWrapper: {
        current: HTMLDivElement;
        prev: HTMLDivElement;
        next: HTMLDivElement;
    },
    dayOfWeekWrapper: HTMLDivElement;
    navigatorTitle: {
        wrapper: HTMLDivElement;
        month: HTMLSpanElement;
        year: HTMLSpanElement;
        yearRange: HTMLSpanElement;
        nextButton: HTMLDivElement;
        prevButton: HTMLDivElement;
    }
}
export type JBCalendarDateRestrictions = {
    min: Dayjs| Date | null;
    max: Dayjs| Date | null;
};
export type JBCalendarData = {
    selectedYear: number;
    selectedMonth: number;
    yearSelectionRange: [number, number];
};

//jalaliday extend dayjs
//import { Dayjs, dayjs } from 'dayjs';
// declare module 'dayjs' {
//     type ModifiedType = Modify<OptionType, {
//         a: number;
//       }>
//     interface OptionType {
//        jalali?: boolean;
//    }
// }
declare module 'dayjs' {
    namespace dayjs {
        type OptionType = { jalali?: boolean, locale?: string, format?: string, utc?: boolean } | string | string[]
    }
}


// }

//end of jalaliday extend dayjs

export type JBCalendarSwipeGestureData = {
    daysWrapper: {
        startX: number | null,
        startY: number | null,
    },
    yearsWrapper: {
        startX: number | null,
    }
}