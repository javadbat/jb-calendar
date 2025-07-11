import CSS from "./jb-calendar.scss";
import {Direction,InputType,
  JBCalendarData,
  JBCalendarDateRestrictions,
  JBCalendarElements,
  JBCalendarSwipeGestureData,
  JBCalendarValue,
} from "./types";
import {
  getYear,
  getMonth,
  getDay,
  isEqual,
  getDaysInMonth,
  getDate,
} from "date-fns";
import {
  newDate,
  isAfter,
  isBefore,
  getYear as getJalaliYear,
  getMonth as getJalaliMonth,
  getDay as getJalaliDay,
  getDaysInMonth as getJalaliDaysInMonth,
  getDate as getJalaliDate,
} from "date-fns-jalali";
import { enToFaDigits } from "jb-core";
import {registerDefaultVariables} from 'jb-core/theme';
import { renderHTML } from "./render";
export * from './types.js';
const JalaliMonthList = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];
const GregorianMonthList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const InputTypes: { [key: string]: InputType } = {
  jalali: "JALALI",
  gregorian: "GREGORIAN",
};
export enum JBCalendarSections {
  day = "DAY",
  month = "MONTH",
  year = "YEAR",
}
export type {JBCalendarValue};
const today = new Date();
if (HTMLElement == undefined) {
  //in case of server render or old browser
  console.error("you cant render web component on a server side");
}
export class JBCalendarWebComponent extends HTMLElement {
  #swipeGestureData: JBCalendarSwipeGestureData = {
    daysWrapper: {
      startX: null,
      startY: null,
    },
    yearsWrapper: {
      startX: null,
    },
  };
  #value: JBCalendarValue = {
    year: null,
    month: null,
    day: null,
  };
  #activeSection: JBCalendarSections | null = null;
  #inputType: InputType = InputTypes.jalali;
  #defaultCalendarData = {
    jalali: {
      year: getJalaliYear(today),
      month: getJalaliMonth(today) + 1,
    },
    gregorian: {
      year: getYear(today),
      month: getMonth(today) + 1,
    },
  };
  #jalaliMonthList = JalaliMonthList;
  #gregorianMonthList = GregorianMonthList;

  /**
   * @public change month labels to desired user label base on language or culture
   */
  setMonthList(inputType: InputType, monthList: string[]) {
    if (Array.isArray(monthList) && monthList.length == 12) {
      switch (inputType) {
        case "JALALI":
          this.#jalaliMonthList = monthList.map((item) => item);
          break;
        case "GREGORIAN":
          this.#gregorianMonthList = monthList;
      }
      this.#initMonthList();
      this.#updateTitleMonth(this.data.selectedMonth);
    } else {
      console.error("Invalid Month List", monthList);
    }
  }
  get defaultCalendarData() {
    return this.#defaultCalendarData;
  }
  set defaultCalendarData(value) {
    this.#defaultCalendarData = value;
  }
  dateRestrictions: JBCalendarDateRestrictions =
    new Proxy<JBCalendarDateRestrictions>(
      {
        min: null,
        max: null,
      },
      this.createDateRestrictionHandler()
    );
  data: JBCalendarData = new Proxy(
    {
      selectedYear: 0,
      selectedMonth: 0,
      yearSelectionRange: [0, 0],
    },
    this.createDataHandler()
  );
  private elements!: JBCalendarElements;
  get value() {
    return this.#value;
  }
  set value(value: JBCalendarValue) {
    const { year, month, day } = value;
    if (year && month && day) {
      this.#value.year = year;
      this.#value.month = month;
      this.#value.day = day;
      this.data.selectedYear = year;
      this.data.selectedMonth = month;
      const prevSelectedDayDom: HTMLDivElement | null =
        this.shadowRoot!.querySelector(`.--selected`);
      if (prevSelectedDayDom !== null) {
        prevSelectedDayDom.classList.remove("--selected");
      }
      if (this.data.selectedYear == year && this.data.selectedMonth == month) {
        const dayDom = this.shadowRoot!.querySelector(
          `.day-wrapper[day-number="${day}"]`
        );
        if (dayDom) {
          dayDom.classList.add("--selected");
        }
      }
    } else {
      console.error(
        "Invalid value. please make sure you have year,month and day"
      );
    }
  }
  get activeSection(): JBCalendarSections {
    // determine we want to see day picker or month picker ,...
    return this.#activeSection || JBCalendarSections.day;
  }
  set activeSection(value: JBCalendarSections) {
    if (value == this.#activeSection) {
      return;
    }
    if (this.#activeSection) {
      //if we have active section before
      const selectionType :"day"|"month"|"year" = this.#activeSection.toLocaleLowerCase() as any;
      this.elements.selectionSections[selectionType].classList.remove("--show");
    }

    if (value == "DAY") {
      this.elements.selectionSections.day.classList.add("--show");
      this.elements.navigatorTitle.month.classList.add("--show");
      this.elements.navigatorTitle.year.classList.add("--show");
      this.elements.navigatorTitle.yearRange.classList.remove("--show");
    }
    if (value == "MONTH") {
      this.elements.selectionSections.month.classList.add("--show");
      this.elements.navigatorTitle.month.classList.remove("--show");
      this.elements.navigatorTitle.year.classList.add("--show");
      this.elements.navigatorTitle.yearRange.classList.remove("--show");
    }
    if (value == "YEAR") {
      this.elements.selectionSections.year.classList.add("--show");
      this.elements.navigatorTitle.month.classList.remove("--show");
      this.elements.navigatorTitle.year.classList.remove("--show");
      this.elements.navigatorTitle.yearRange.classList.add("--show");
    }
    this.#activeSection = value;
  }
  get inputType() {
    return this.#inputType;
  }
  set inputType(value) {
    this.#inputType = value;
    this.onInputTypeChange();
  }
  #showPersianNumber = false;
  get showPersianNumber() {
    return this.#showPersianNumber;
  }
  set showPersianNumber(value: boolean) {
    if (typeof value !== "boolean") {
      console.error("showPersianNumber must be boolean");
      return;
    }
    this.#showPersianNumber = value;
    this.setCalendarData();
  }
  //for layout direction
  get cssDirection(): Direction {
    return getComputedStyle(this).direction as Direction;
  }
  #direction: Direction | null = null;
  get direction() {
    return this.#direction?this.#direction:this.cssDirection;
  }
  set direction(dir: Direction) {
    if (dir && (dir == "ltr" || dir == "rtl")) {
      this.#direction = dir;
    }
    this.setupStyleBaseOnCssDirection();
  }
  constructor() {
    super();
    this.initWebComponent();
    this.initProps();
    this.initCalendar();
  }
  connectedCallback() {
    // standard web component event that called when all of dom is bound

    this.callOnLoadEvent();
    this.setupStyleBaseOnCssDirection();
    this.initCalendarLayout();
  }
  initCalendarLayout() {
    this.#initMonthList();
    this.fillDayOfWeek();
    this.setCalendarData();
  }
  /**
   * @public its public because we cant detect css dir change by js so we have to let user change it manually  
   * @description set elements direction base on current css direction or seated direction.
   * @param dir 
   */
  setupStyleBaseOnCssDirection(dir: Direction = this.direction) {
    //change some calendar style base on css direction of the element
    //TODO: use css `if()` when it become standard
    if (dir == "ltr") {
      this.elements.navigatorTitle.nextButton.classList.add("--css-ltr");
      this.elements.navigatorTitle.prevButton.classList.add("--css-ltr");
      this.elements.monthDayWrapper.next.classList.add("--css-ltr");
      this.elements.monthDayWrapper.prev.classList.add("--css-ltr");
      this.elements.yearsWrapper.next.classList.add("--css-ltr");
      this.elements.yearsWrapper.prev.classList.add("--css-ltr");
    } else if (dir == "rtl") {
      this.elements.navigatorTitle.nextButton.classList.remove("--css-ltr");
      this.elements.navigatorTitle.prevButton.classList.remove("--css-ltr");
      this.elements.monthDayWrapper.next.classList.remove("--css-ltr");
      this.elements.monthDayWrapper.prev.classList.remove("--css-ltr");
      this.elements.yearsWrapper.next.classList.remove("--css-ltr");
      this.elements.yearsWrapper.prev.classList.remove("--css-ltr");
    }
  }
  fillDayOfWeek() {
    //fill day of week bas on input type
    const gregorianDayOfWeekArray = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const jalaliDayOfWeekArray = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
    const dayOfWeekArray =
      this.inputType == InputTypes.jalali
        ? jalaliDayOfWeekArray
        : gregorianDayOfWeekArray;
    this.elements.dayOfWeekWrapper.innerHTML = "";
    for (let i = 0; i <= 6; i++) {
      //day of week dom
      const dowDom = document.createElement("div");
      dowDom.classList.add("week-day");
      dowDom.innerHTML = dayOfWeekArray[i];
      this.elements.dayOfWeekWrapper.appendChild(dowDom);
    }
  }
  setCalendarData() {
    // we set default value for selected year and month here becuase we want user config value and min max date ,... in on init so we update our dom and calendar base on them
    if (this.inputType == InputTypes.jalali) {
      this.data.selectedYear =
        this.value.year || this.data.selectedYear || this.#defaultCalendarData.jalali.year;
      this.data.selectedMonth =
        this.value.month || this.data.selectedMonth || this.#defaultCalendarData.jalali.month;
      this.data.yearSelectionRange = [
        this.data.selectedYear - 4,
        this.data.selectedYear + 7,
      ];
      //chnage swipe up section text
      this.shadowRoot!.querySelector(".swipe-up-text")!.innerHTML =
        "نمایش سال‌ها";
    } else {
      this.data.selectedYear = this.value.year|| this.data.selectedYear || this.#defaultCalendarData.gregorian.year;
      this.data.selectedMonth = this.value.month || this.data.selectedMonth || this.#defaultCalendarData.gregorian.month;
      this.data.yearSelectionRange = [
        this.data.selectedYear - 4,
        this.data.selectedYear + 7,
      ];
      //chnage swipe up section text
      this.shadowRoot!.querySelector(".swipe-up-text")!.innerHTML =
        "show years";
    }
  }
  callOnLoadEvent() {
    const event = new CustomEvent("load", { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  callOnInitEvent() {
    const event = new CustomEvent("init", { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  initWebComponent() {
    const shadowRoot = this.attachShadow({ mode: "open" });
    registerDefaultVariables();
    const html = `<style>${CSS}</style>` + "\n" + renderHTML();
    const element = document.createElement("template");
    element.innerHTML = html;
    shadowRoot.appendChild(element.content.cloneNode(true));
    this.elements = {
      selectionSections: {
        day: shadowRoot.querySelector(".day-selection-section")!,
        month: shadowRoot.querySelector(".month-selection-section")!,
        year: shadowRoot.querySelector(".year-selection-section")!,
      },
      monthDayWrapper: {
        current: shadowRoot.querySelector(".current-month-day-wrapper")!,
        prev: shadowRoot.querySelector(".prev-month-day-wrapper")!,
        next: shadowRoot.querySelector(".next-month-day-wrapper")!,
      },
      yearsWrapper: {
        current: shadowRoot.querySelector(".current-years-wrapper")!,
        prev: shadowRoot.querySelector(".prev-years-wrapper")!,
        next: shadowRoot.querySelector(".next-years-wrapper")!,
      },
      dayOfWeekWrapper: shadowRoot.querySelector(".week-day-wrapper")!,
      navigatorTitle: {
        month: shadowRoot.querySelector(".navigator-title .month")!,
        year: shadowRoot.querySelector(".navigator-title .year")!,
        yearRange: shadowRoot.querySelector(".navigator-title .year-range")!,
        nextButton: shadowRoot.querySelector(".next-btn")!,
        prevButton: shadowRoot.querySelector(".prev-btn")!,
        wrapper: shadowRoot.querySelector(".navigator-title")!,
      },
      swipeupSymbol: shadowRoot.querySelector(".swipe-up-symbol")!,
    };
    this.registerEventHandlers();
    window.matchMedia
  }
  registerEventHandlers() {
    this.elements.navigatorTitle.nextButton.addEventListener("click",this.onNextButtonClicked.bind(this));
    this.elements.navigatorTitle.prevButton.addEventListener("click",this.onPrevButtonClicked.bind(this));
    this.elements.navigatorTitle.year.addEventListener("click",this.onNavigatorTitleYearClicked.bind(this));
    this.elements.navigatorTitle.month.addEventListener("click",this.onNavigatorTitleMonthClicked.bind(this));
    //add support for swiping
    this.elements.selectionSections.day.addEventListener("touchstart",this.onDayWrapperTouchStart.bind(this)
);
    this.elements.selectionSections.day.addEventListener(
      "touchmove",
      this.onDayWrapperTouchMove.bind(this)
    );
    this.elements.selectionSections.day.addEventListener(
      "touchend",
      this.onDayWrapperTouchEnd.bind(this)
    );
    //swipe for year list
    this.elements.selectionSections.year.addEventListener(
      "touchstart",
      this.onYearWrapperTouchStart.bind(this)
    );
    this.elements.selectionSections.year.addEventListener(
      "touchmove",
      this.onYearWrapperTouchMove.bind(this)
    );
    this.elements.selectionSections.year.addEventListener(
      "touchend",
      this.onYearWrapperTouchEnd.bind(this)
    );
  }
  onDayWrapperTouchStart(e: TouchEvent) {
    this.#swipeGestureData.daysWrapper.startX = e.touches[0].clientX;
    this.#swipeGestureData.daysWrapper.startY = e.touches[0].clientY;
  }
  onDayWrapperTouchMove(e: TouchEvent) {
    if (
      this.#swipeGestureData.daysWrapper.startX !== null &&
      this.#swipeGestureData.daysWrapper.startY !== null
    ) {
      e.preventDefault();
      const deltaX =
        e.touches[0].clientX - this.#swipeGestureData.daysWrapper.startX;
      const deltaY =
        e.touches[0].clientY - this.#swipeGestureData.daysWrapper.startY;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        //when user swipe horizentally
        //first wen remove and reset vertical effect
        this.elements.swipeupSymbol.classList.remove("--show");
        this.elements.swipeupSymbol.style.transform = `translateY(${0}px)`;
        this.elements.swipeupSymbol.style.opacity = `0`;
        //then move horizentally
        this.elements.monthDayWrapper.current.style.transform = `translateX(${deltaX}px)`;
        this.elements.monthDayWrapper.prev.style.transform = `translateX(${deltaX}px)`;
        this.elements.monthDayWrapper.next.style.transform = `translateX(${deltaX}px)`;
      } else {
        //if user swipe more vertically than horizentally we reset horizental swipe change
        this.elements.monthDayWrapper.current.style.transform = `translateX(${0}px)`;
        this.elements.monthDayWrapper.prev.style.transform = `translateX(${0}px)`;
        this.elements.monthDayWrapper.next.style.transform = `translateX(${0}px)`;
        //then we move calendar vertically
        this.elements.monthDayWrapper.current.style.transform = `translateY(${deltaY}px)`;
        if (deltaY < 0) {
          //on swipe up
          this.elements.swipeupSymbol.classList.add("--show");
          const opacity = Math.abs(deltaY) / 70;
          if (Math.abs(deltaY) > 32) {
            this.elements.swipeupSymbol.style.transform = `translateY(${0}px)`;
          } else {
            this.elements.swipeupSymbol.style.transform = `translateY(${
              deltaY + 32
            }px)`;
          }
          this.elements.swipeupSymbol.style.opacity = `${opacity}`;
        }
      }
    }
  }
  onDayWrapperTouchEnd(e: TouchEvent) {
    //handle horizental swipe
    if (this.#swipeGestureData.daysWrapper.startX !== null) {
      const clientX = e.changedTouches[0].clientX;
      const deltaX = clientX - this.#swipeGestureData.daysWrapper.startX;
      this.#swipeGestureData.daysWrapper.startX = null;
      if (Math.abs(deltaX) > 100) {
        //detemine direcion of change
        let swipeDirection = deltaX > 0 ? "next" : "prev";
        if (this.direction == "ltr") {
          swipeDirection = deltaX > 0 ? "prev" : "next";
        }
        //do the transition
        if (swipeDirection == "prev") {
          this.elements.monthDayWrapper.current.style.transform = `translateX(${0}px)`;
          this.elements.monthDayWrapper.prev.style.transform = `translateX(${0}px)`;
          this.elements.monthDayWrapper.next.style.transform = `translateX(${0}px)`;
          this.onPrevButtonClicked();
        } else {
          this.elements.monthDayWrapper.current.style.transform = `translateX(${0}px)`;
          this.elements.monthDayWrapper.prev.style.transform = `translateX(${0}px)`;
          this.elements.monthDayWrapper.next.style.transform = `translateX(${0}px)`;
          this.onNextButtonClicked();
        }
      } else {
        this.moveBackToPos(this.elements.monthDayWrapper.current);
        this.moveBackToPos(this.elements.monthDayWrapper.prev);
        this.moveBackToPos(this.elements.monthDayWrapper.next);
      }
    }

    // handle vertical swipe
    if (this.#swipeGestureData.daysWrapper.startY !== null) {
      const clientY = e.changedTouches[0].clientY;
      const deltaY = clientY - this.#swipeGestureData.daysWrapper.startY;
      this.#swipeGestureData.daysWrapper.startY = null;
      this.elements.swipeupSymbol.classList.remove("--show");
      this.elements.swipeupSymbol.style.transform = `translateY(${0}px)`;
      this.elements.swipeupSymbol.style.opacity = `0`;
      if (Math.abs(deltaY) > 70) {
        if (deltaY > 0) {
          //on swipe down
          this.activeSection = JBCalendarSections.month;
        } else {
          this.activeSection = JBCalendarSections.year;
        }
      }
    }
  }

  onYearWrapperTouchStart(e: TouchEvent) {
    this.#swipeGestureData.yearsWrapper.startX = e.touches[0].clientX;
  }
  onYearWrapperTouchMove(e: TouchEvent) {
    if (this.#swipeGestureData.yearsWrapper.startX !== null) {
      this.elements.yearsWrapper.current.style.transform = `translateX(${
        e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX
      }px)`;
      this.elements.yearsWrapper.prev.style.transform = `translateX(${
        e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX
      }px)`;
      this.elements.yearsWrapper.next.style.transform = `translateX(${
        e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX
      }px)`;
    }
  }
  onYearWrapperTouchEnd(e: TouchEvent) {
    if (this.#swipeGestureData.yearsWrapper.startX !== null) {
      const clientX = e.changedTouches[0].clientX;
      const deltaX = clientX - this.#swipeGestureData.yearsWrapper.startX;
      this.#swipeGestureData.yearsWrapper.startX = null;

      //detemine direcion of change
      let swipeDirection = deltaX > 0 ? "next" : "prev";
      if (this.direction == "ltr") {
        swipeDirection = deltaX > 0 ? "prev" : "next";
      }
      if (Math.abs(deltaX) > 100) {
        if (swipeDirection == "prev") {
          this.elements.yearsWrapper.current.style.transform = `translateX(${0}px)`;
          this.elements.yearsWrapper.prev.style.transform = `translateX(${0}px)`;
          this.elements.yearsWrapper.next.style.transform = `translateX(${0}px)`;
          this.onPrevButtonClicked();
        } else {
          this.elements.yearsWrapper.current.style.transform = `translateX(${0}px)`;
          this.elements.yearsWrapper.prev.style.transform = `translateX(${0}px)`;
          this.elements.yearsWrapper.next.style.transform = `translateX(${0}px)`;
          this.onNextButtonClicked();
        }
      } else {
        this.moveBackToPos(this.elements.yearsWrapper.current);
        this.moveBackToPos(this.elements.yearsWrapper.prev);
        this.moveBackToPos(this.elements.yearsWrapper.next);
      }
    }
  }
  moveBackToPos(dom: HTMLElement) {
    if (dom) {
      //remove all transform and changed pos from element and returned it to natrual place. used on drop event
      dom.style.transition = `transform 0.3s 0s ease`;
      //remove above assigned animation
      setTimeout(() => {
        dom.style.transition = "";
      }, 300);
      dom.style.transform = ``;
    }
  }
  #updateTitleMonth(monthIndex: number) {
    const monthName =
      this.inputType == InputTypes.jalali
        ? this.#jalaliMonthList[monthIndex - 1]
        : this.#gregorianMonthList[monthIndex - 1];
    this.elements.navigatorTitle.month.innerHTML = monthName;
  }
  createDataHandler() {
    const onYearChanged = (newYear: number, prevYear: number) => {
      this.elements.navigatorTitle.year.innerHTML = this.localizeString(
        newYear.toString()
      );
    };
    const onMonthChanged = (newMonth: number, prevMonth: number) => {
      this.#updateTitleMonth(newMonth);
      this.fillMonthDays();
    };
    const onYearSelectionRangeChanged = (newRange: number[]) => {
      this.elements.navigatorTitle.yearRange.innerHTML = this.localizeString(
        `${newRange[0]} - ${newRange[1]}`
      );
      this.fillYearList();
    };
    const dataHandler = {
      set: (obj: any, prop: string, value: number | number[]) => {
        if (prop == "selectedYear") {
          onYearChanged(value as number, obj.selectedYear);
          obj[prop] = value;
        }
        if (prop == "selectedMonth") {
          obj[prop] = value;
          onMonthChanged(value as number, obj.selectedMonth);
        }
        if (prop == "yearSelectionRange" && Array.isArray(value)) {
          obj[prop] = value;
          onYearSelectionRangeChanged(value);
        }
        return true;
      },
    };
    return dataHandler;
  }
  createDateRestrictionHandler() {
    const restrictionHandler = {
      set: (obj: any, prop: string, value: number) => {
        obj[prop] = value;
        switch (prop) {
          case "min":
            if (this.activeSection == "DAY") {
              this.fillMonthDays();
            }
            break;
          case "max":
            if (this.activeSection == "DAY") {
              this.fillMonthDays();
            }
            break;
        }
        return true;
      },
    };
    return restrictionHandler;
  }
  initProps() {
    //default input type of this component is jalali
    this.callOnInitEvent();
  }
  selectToday() {
    const today = new Date();
    if (this.inputType == InputTypes.jalali) {
      this.select(
        getJalaliYear(today),
        getJalaliMonth(today) + 1,
        getJalaliDay(today)
      );
    } else {
      this.select(getYear(today), getMonth(today) + 1, getDay(today));
    }
  }
  select(year: number, month: number, day: number) {
    this.value = {
      year: year,
      month: month,
      day: day,
    };
  }
  initCalendar() {
    if (!this.#activeSection) {
      this.activeSection = JBCalendarSections.day;
    }
  }
  #mapGregorianDayOfWeekToJalali(dayNumber: number) {
    // for example sunday is 0 so 2(yekshanbe) will return
    const mapper = [2, 3, 4, 5, 6, 7, 1];
    return mapper[dayNumber];
  }
  fillYearList() {
    this.fillYearListDom(
      this.data.yearSelectionRange[0],
      this.data.yearSelectionRange[1],
      "current"
    );
    this.fillYearListDom(
      this.data.yearSelectionRange[0] - 12,
      this.data.yearSelectionRange[1] - 12,
      "prev"
    );
    this.fillYearListDom(
      this.data.yearSelectionRange[0] + 12,
      this.data.yearSelectionRange[1] + 12,
      "next"
    );
  }
  fillYearListDom(startYear: number, endYear: number, type: "current" | "prev" | "next") {
    this.elements.yearsWrapper[type].innerHTML = "";
    for (let i = startYear; i <= endYear; i++) {
      const yearDom = this.createYearDom(i);
      this.elements.yearsWrapper[type].appendChild(yearDom);
    }
  }
  createYearDom(year: number) {
    const monthDom = document.createElement("div");
    monthDom.classList.add("year-wrapper");
    const monthTextDom = document.createElement("div");
    monthTextDom.classList.add("year-number");
    monthTextDom.innerHTML = this.localizeString(year.toString());
    monthDom.appendChild(monthTextDom);
    monthDom.addEventListener("click", () => {
      this.data.selectedYear = year;
      this.activeSection = JBCalendarSections.month;
    });
    return monthDom;
  }
  #initMonthList() {
    this.elements.selectionSections.month.innerHTML = "";
    for (let i = 1; i < 13; i++) {
      const monthDom = this.#createMonthDom(i);
      this.elements.selectionSections.month.appendChild(monthDom);
    }
  }
  #createMonthDom(monthIndex: number) {
    const monthDom = document.createElement("div");
    monthDom.classList.add("month-wrapper");
    const monthTextDom = document.createElement("div");
    monthTextDom.classList.add("month-name");
    const monthName =
      this.inputType == InputTypes.jalali
        ? this.#jalaliMonthList[monthIndex - 1]
        : this.#gregorianMonthList[monthIndex - 1];
    monthTextDom.innerHTML = monthName;
    monthDom.appendChild(monthTextDom);
    monthDom.addEventListener("click", () => {
      this.data.selectedMonth = monthIndex;
      this.activeSection = JBCalendarSections.day;
    });
    return monthDom;
  }
  #getDate(year: number, month: number, day: number): Date {
    if (this.inputType == InputTypes.jalali) {
      return newDate(year, month - 1, day);
    }
    return new Date(year, month - 1, day);
  }
  #getWeekDayIndex(date: Date): number {
    if (this.inputType == InputTypes.jalali) {
      return this.#mapGregorianDayOfWeekToJalali(getJalaliDay(date));
    }
    return getDay(date);
  }
  #getDaysInMonth(date: Date): number {
    if (this.inputType == InputTypes.jalali) {
      return getJalaliDaysInMonth(date);
    }
    return getDaysInMonth(date);
  }
  #isToday(day: number, month: number, year: number): boolean {
    const today = new Date();
    if (this.inputType == InputTypes.jalali) {
      return (
        getJalaliYear(today) == year &&
        getJalaliMonth(today) == month - 1 &&
        getJalaliDate(today) == day
      );
    }
    return (
      getYear(today) == year &&
      getMonth(today) == month - 1 &&
      getDate(today) == day
    );
  }
  fillMonthDaysDom(year: number, month: number, type: "current" | "prev" | "next") {
    const firstDayOfMonthDate = this.#getDate(year, month, 1);
    // const firstDayInWeek = this.inputType == InputTypes.jalali ? this.mapGregorianDayOfWeekToJalali(firstDayOfMonthDate.day()) : firstDayOfMonthdate.day() + 1;
    const firstDayInWeek = this.#getWeekDayIndex(firstDayOfMonthDate);

    this.elements.monthDayWrapper[type].innerHTML = "";
    for (let i = 1; i < firstDayInWeek; i++) {
      const emptyDayDom = this.createEmptyDayDom();
      this.elements.monthDayWrapper[type].appendChild(emptyDayDom);
    }
    const dayInMonth = this.#getDaysInMonth(firstDayOfMonthDate);
    for (let i = 1; i <= dayInMonth; i++) {
      const dayDate = this.#getDate(
        this.data.selectedYear,
        this.data.selectedMonth,
        i
      );
      const isToday = this.#isToday(
        i,
        this.data.selectedMonth,
        this.data.selectedYear
      );
      const isSelected =
        this.value.year == this.data.selectedYear &&
        this.value.month == this.data.selectedMonth &&
        this.value.day == i;
      const isDisable = !this.checkIsDayDisable(dayDate).isAllValid;
      const dayDom = this.createDayDom(
        i,
        this.data.selectedYear,
        this.data.selectedMonth,
        isToday,
        isSelected,
        isDisable
      );
      this.elements.monthDayWrapper[type].appendChild(dayDom);
    }
  }
  fillMonthDays() {
    const currentMonth = this.data.selectedMonth;
    const currentYear = this.data.selectedYear;
    //set prev month days
    let prevMonth, prevYear;
    if (currentMonth > 1) {
      prevMonth = currentMonth - 1;
      prevYear = this.data.selectedYear;
    } else {
      prevYear = this.data.selectedYear - 1;
      prevMonth = 12;
    }
    this.fillMonthDaysDom(prevYear, prevMonth, "prev");
    //update current month days
    this.fillMonthDaysDom(currentYear, currentMonth, "current");
    //update next month days
    let nextMonth: number, nextYear: number;
    if (currentMonth < 12) {
      nextMonth = currentMonth + 1;
      nextYear = this.data.selectedYear;
    } else {
      nextYear = this.data.selectedYear + 1;
      nextMonth = 1;
    }
    this.fillMonthDaysDom(nextYear, nextMonth, "next");
  }
  checkIsDayDisable(dayDate: Date) {
    const result = {
      min: true,
      max: true,
      get isAllValid() {
        return this.min && this.max;
      },
    };
    if (this.dateRestrictions.min) {
      result.min =
        isAfter(dayDate, this.dateRestrictions.min) ||
        isEqual(dayDate, this.dateRestrictions.min);
    }
    if (this.dateRestrictions.max) {
      result.max =
        isBefore(dayDate, this.dateRestrictions.max) ||
        isEqual(dayDate, this.dateRestrictions.max);
    }
    return result;
  }
  createEmptyDayDom() {
    const dayDom = document.createElement("div");
    dayDom.classList.add("empty-day");
    return dayDom;
  }
  createDayDom(
    dayNumber: number,
    year: number,
    month: number,
    isToday: boolean,
    isSelected: boolean,
    isDisable: boolean
  ) {
    //create dom
    const dayDom = document.createElement("div");
    dayDom.classList.add("day-wrapper");
    dayDom.setAttribute("day-number", dayNumber.toString());
    if (isToday) {
      dayDom.classList.add("--today");
    }
    if (isSelected) {
      dayDom.classList.add("--selected");
    }
    //
    const dayNumberWrapperDom = document.createElement("div");
    dayNumberWrapperDom.classList.add("day-number-wrapper");
    //
    const dayNumberDom = document.createElement("div");
    dayNumberDom.classList.add("day-number");
    dayNumberDom.innerHTML = this.localizeString(dayNumber.toString());
    const statusPoint = document.createElement("div");
    statusPoint.classList.add("status-point");
    //
    dayNumberWrapperDom.appendChild(dayNumberDom);
    dayDom.appendChild(statusPoint);
    dayDom.appendChild(dayNumberWrapperDom);
    if (!isDisable) {
      // add event listeners
      dayDom.addEventListener("click", () => {
        this.onDayClicked(year, month, dayNumber);
      });
    } else {
      dayDom.classList.add("--disable");
    }
    return dayDom;
  }
  onDayClicked(year: number, month: number, dayNumber: number) {
    this.select(year, month, dayNumber);
    const event = new CustomEvent("select");
    this.dispatchEvent(event);
  }
  onNextButtonClicked() {
    if (this.activeSection == "DAY") {
      const selectedMonth = this.data.selectedMonth;
      if (selectedMonth < 12) {
        this.data.selectedMonth = selectedMonth + 1;
      } else {
        this.data.selectedYear = this.data.selectedYear + 1;
        this.data.selectedMonth = 1;
      }
    }
    if (this.activeSection == "MONTH") {
      this.data.selectedYear = this.data.selectedYear + 1;
    }
    if (this.activeSection == "YEAR") {
      const minYear = this.data.yearSelectionRange[0] + 12;
      const maxYear = this.data.yearSelectionRange[1] + 12;
      this.data.yearSelectionRange = [minYear, maxYear];
    }
  }

  onPrevButtonClicked() {
    if (this.activeSection == "DAY") {
      const selectedMonth = this.data.selectedMonth;
      if (selectedMonth > 1) {
        this.data.selectedMonth = selectedMonth - 1;
      } else {
        this.data.selectedYear = this.data.selectedYear - 1;
        this.data.selectedMonth = 12;
      }
    }

    if (this.activeSection == "MONTH") {
      this.data.selectedYear = this.data.selectedYear - 1;
    }
    if (this.activeSection == "YEAR") {
      const minYear = this.data.yearSelectionRange[0] - 12;
      const maxYear = this.data.yearSelectionRange[1] - 12;
      if (minYear > 0) {
        this.data.yearSelectionRange = [minYear, maxYear];
      }
    }
  }
  onNavigatorTitleYearClicked() {
    if (
      this.activeSection == JBCalendarSections.day ||
      this.activeSection == JBCalendarSections.month
    ) {
      this.activeSection = JBCalendarSections.year;
    }
  }
  onNavigatorTitleMonthClicked() {
    if (this.activeSection == JBCalendarSections.day) {
      this.activeSection = JBCalendarSections.month;
    }
  }
  onInputTypeChange() {
    // when date input type change this function get called
    this.setCalendarData();
    this.fillDayOfWeek();
    this.#initMonthList();
  }
  localizeString(string: string): string {
    if (this.showPersianNumber) {
      return enToFaDigits(string);
    } else {
      return string;
    }
  }
}
const myElementNotExists = !customElements.get("jb-calendar");
if (myElementNotExists) {
  window.customElements.define("jb-calendar", JBCalendarWebComponent);
}
