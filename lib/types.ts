
import type {EventTypeWithTarget} from 'jb-core';
import type { JBCalendarWebComponent } from './jb-calendar';
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
    },
    swipeupSymbol:HTMLDivElement;
}
export type JBCalendarDateRestrictions = {
    min: Date | null;
    max: Date | null;
};
export type JBCalendarData = {
    selectedYear: number;
    selectedMonth: number;
    yearSelectionRange: [number, number];
};

export type JBCalendarSwipeGestureData = {
    daysWrapper: {
        startX: number | null,
        startY: number | null,
    },
    yearsWrapper: {
        startX: number | null,
    }
}
export type Direction = "rtl" | "ltr" ;
export type InputType = 'JALALI' | 'GREGORIAN';
export type JBCalendarEventType<TEvent> = EventTypeWithTarget<TEvent,JBCalendarWebComponent>;