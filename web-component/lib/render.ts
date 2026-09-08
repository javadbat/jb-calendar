import { i18n } from "jb-core/i18n";
import { dictionary } from "./i18n";
import 'jb-icons/arrow';
import 'jb-button';

type YearListType = "current" | "prev" | "next";

type RenderYearListArgs = {
  wrappers: Record<YearListType, HTMLDivElement>;
  yearSelectionRange: [number, number];
  localize: (value: string) => string;
  isDisabled: (year: number) => boolean;
  onSelect: (year: number) => void;
};

type CreateMonthDomArgs = {
  monthIndex: number;
  monthName: string;
  isDisabled: boolean;
  onSelect: (monthIndex: number) => void;
};

type RenderMonthListArgs = {
  wrapper: HTMLDivElement;
  monthList: string[];
  isDisabled: (monthIndex: number) => boolean;
  onSelect: (monthIndex: number) => void;
};

type CreateDayDomArgs = {
  dayNumber: number;
  year: number;
  month: number;
  isToday: boolean;
  isSelected: boolean;
  isDisable: boolean;
  localizedDayNumber: string;
  onSelect: (year: number, month: number, dayNumber: number) => void;
};

export function renderHTML(): string {
  return /* html */ `
  <div class="jb-calendar-web-component" part="root">
    <section class="navigator-section" part="navigator">
        <jb-button square size="sm"  color="light" class="prev-btn" part="arrow-button prev-button" tabindex="-1" aria-label="${dictionary.get(i18n,"prev")}" title="${dictionary.get(i18n,"prev")}">
           <jb-icon-arrow direction="inline-start" />
        </jb-button>
        <div class="navigator-title" part="navigator-title">
            <button class="month" part="navigator-month" type="button" tabindex="-1"></button>
            <button class="year" part="navigator-year" type="button" tabindex="-1"></button>
            <span class="year-range" part="navigator-year-range"></span>
        </div>
        <jb-button square size="sm"  color="light" class="next-btn" part="arrow-button next-button" type="button" tabindex="-1" aria-label="${dictionary.get(i18n,"next")}" title="${dictionary.get(i18n,"next")}">
            <jb-icon-arrow direction="inline-end" />
        </jb-button>

    </section>
    <section class="calendar-section" part="calendar">
        <div class="day-selection-section" part="day-section">
            <div class="week-day-wrapper" part="week-day-wrapper" role="group">
            </div>
            <div class="month-day-container" part="month-day-container" role="group" aria-label="${dictionary.get(i18n,"days")}">
                <div class="prev-month-day-wrapper month-day-wrapper" part="month-day-wrapper prev-month-day-wrapper"></div>
                <div class="current-month-day-wrapper month-day-wrapper" part="month-day-wrapper current-month-day-wrapper"></div>
                <div class="next-month-day-wrapper month-day-wrapper" part="month-day-wrapper next-month-day-wrapper"></div>
            </div>
        </div>
        <div class="month-selection-section" part="month-section">

        </div>
        <div class="year-selection-section" part="year-section">
            <div class="prev-years-wrapper years-wrapper" part="years-wrapper prev-years-wrapper"></div>
            <div class="current-years-wrapper years-wrapper" part="years-wrapper current-years-wrapper"></div>
            <div class="next-years-wrapper years-wrapper" part="years-wrapper next-years-wrapper"></div>
        </div>
        <div class="swipe-up-symbol" part="swipe-up">
            <jb-icon-arrow direction="up" class="swipe-up-icon"></jb-icon-arrow>
            <div class="swipe-up-text" part="swipe-up-text">${dictionary.get(i18n,"showAllYear")}</div>
        </div>
    </section>
  </div>
  `;
}

export function renderYearList({
  wrappers,
  yearSelectionRange,
  localize,
  isDisabled,
  onSelect,
}: RenderYearListArgs) {
  const ranges: Array<[YearListType, number, number]> = [
    ["current", yearSelectionRange[0], yearSelectionRange[1]],
    ["prev", yearSelectionRange[0] - 12, yearSelectionRange[1] - 12],
    ["next", yearSelectionRange[0] + 12, yearSelectionRange[1] + 12],
  ];

  for (const [type, startYear, endYear] of ranges) {
    wrappers[type].replaceChildren(
      ...Array.from({ length: endYear - startYear + 1 }, (_, index) => {
        const year = startYear + index;
        return createYearDom(
          year,
          localize(year.toString()),
          isDisabled(year),
          onSelect
        );
      })
    );
  }
}

export function createYearDom(
  year: number,
  localizedYear: string,
  isDisabled: boolean,
  onSelect: (year: number) => void
) {
  const yearDom = document.createElement("jb-button");
  yearDom.setAttribute("type", "button");
  yearDom.setAttribute("variant", "ghost");
  yearDom.setAttribute("color", "dark");
  yearDom.disabled = isDisabled;
  yearDom.tabIndex = -1;
  yearDom.setAttribute("aria-label", year.toString());
  yearDom.classList.add("year-wrapper");
  yearDom.part.add("year");

  const yearTextDom = document.createElement("span");
  yearTextDom.classList.add("year-number");
  yearTextDom.part.add("year-number");
  yearTextDom.textContent = localizedYear;
  yearDom.appendChild(yearTextDom);
  if (!isDisabled) {
    yearDom.addEventListener("click", () => onSelect(year));
  }
  return yearDom;
}

export function createMonthDom({ monthIndex, monthName, isDisabled, onSelect }: CreateMonthDomArgs) {
  const monthDom = document.createElement("jb-button");
  monthDom.setAttribute("type", "button");
  monthDom.setAttribute("variant", "ghost");
  monthDom.setAttribute("color", "dark");
  monthDom.setAttribute("size", "sm");
  monthDom.disabled = isDisabled;
  monthDom.tabIndex = -1;
  monthDom.classList.add("month-wrapper");
  monthDom.part.add("month");
  monthDom.setAttribute("aria-label", monthName);

  const monthTextDom = document.createElement("span");
  monthTextDom.classList.add("month-name");
  monthTextDom.part.add("month-name");
  monthTextDom.textContent = monthName;
  monthDom.appendChild(monthTextDom);
  if (!isDisabled) {
    monthDom.addEventListener("click", () => onSelect(monthIndex));
  }
  return monthDom;
}

export function renderMonthList({
  wrapper,
  monthList,
  isDisabled,
  onSelect,
}: RenderMonthListArgs) {
  wrapper.replaceChildren(
    ...monthList.map((monthName, index) =>
      createMonthDom({
        monthIndex: index + 1,
        monthName,
        isDisabled: isDisabled(index + 1),
        onSelect,
      })
    )
  );
}

export function createDayDom({
  dayNumber,
  year,
  month,
  isToday,
  isSelected,
  isDisable,
  localizedDayNumber,
  onSelect,
}: CreateDayDomArgs) {
  const dayDom = document.createElement("button");
  dayDom.type = "button";
  dayDom.tabIndex = -1;
  dayDom.setAttribute("aria-label", `${year}-${month}-${dayNumber}`);
  dayDom.setAttribute("aria-pressed", isSelected ? "true" : "false");
  dayDom.disabled = isDisable;
  if (isToday) dayDom.setAttribute("aria-current", "date");
  dayDom.classList.add("day-wrapper");
  dayDom.part.add("day");
  dayDom.setAttribute("day-number", dayNumber.toString());
  if (isToday) {
    dayDom.classList.add("--today");
    dayDom.part.add("today-day");
  }
  if (isSelected) {
    dayDom.classList.add("--selected");
    dayDom.part.add("selected-day");
  }

  const dayNumberWrapperDom = document.createElement("span");
  dayNumberWrapperDom.classList.add("day-number-wrapper");
  dayNumberWrapperDom.part.add("day-button");

  const dayNumberDom = document.createElement("span");
  dayNumberDom.classList.add("day-number");
  dayNumberDom.part.add("day-number");
  dayNumberDom.innerHTML = localizedDayNumber;
  const statusPoint = document.createElement("span");
  statusPoint.classList.add("status-point");
  statusPoint.part.add("status-point");

  dayNumberWrapperDom.appendChild(dayNumberDom);
  dayDom.appendChild(statusPoint);
  dayDom.appendChild(dayNumberWrapperDom);
  if (!isDisable) {
    dayDom.addEventListener("click", () => {
      onSelect(year, month, dayNumber);
    });
  } else {
    dayDom.classList.add("--disable");
    dayDom.part.add("disabled-day");
  }
  return dayDom;
}
