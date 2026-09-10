import { defineWebComponent, JBBaseComponent, enToFaDigits } from "jb-core";
import CSS from "./jb-calendar.css";
import VariableCSS from "./variables.css";

import type {
  Direction,
  InputType,
  JBCalendarData,
  JBCalendarDateRestrictions,
  JBCalendarElements,
  JBCalendarSwipeGestureData,
  JBCalendarValue,
  JBCalendarSections,
} from "./types";
import { getYear, getMonth, getDay, isEqual, getDaysInMonth, getDate } from "date-fns";
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
import { registerDefaultVariables } from "jb-core/theme";
import { createDayDom, renderHTML, renderMonthList, renderYearList } from "./render";
import { dictionary } from "./i18n";
import { i18n } from "jb-core/i18n";
import { getDefaultCalendarData, getEmptyValue } from "./constants";
export * from "./types.js";

const InputTypes: { [key: string]: InputType } = {
  jalali: "JALALI",
  gregorian: "GREGORIAN",
};

export type { JBCalendarValue };

export class JBCalendarWebComponent extends JBBaseComponent {
  #internals?: ElementInternals;
  #swipeGestureData: JBCalendarSwipeGestureData = {
    daysWrapper: {
      startX: null,
      startY: null,
    },
    yearsWrapper: {
      startX: null,
    },
  };
  #value: JBCalendarValue = getEmptyValue();
  #activeSection: JBCalendarSections | null = null;
  #inputType: InputType = i18n.locale.calendar == "persian" ? InputTypes.jalali : InputTypes.gregorian;
  #hasInputTypeOverride = false;
  #hasShowPersianNumberOverride = false;
  #jalaliMonthListOverridden = false;
  #gregorianMonthListOverridden = false;
  #unsubscribeLocaleChange: VoidFunction | null = null;
  #isUpdatingCalendarData = false;
  #defaultCalendarData = getDefaultCalendarData();
  #jalaliMonthList = dictionary.get(i18n, "jalaliMonthList");
  #gregorianMonthList = dictionary.get(i18n, "gregorianMonthList");

  /**
   * @public change month labels to desired user label base on language or culture
   */
  setMonthList(inputType: InputType, monthList: string[]) {
    if (Array.isArray(monthList) && monthList.length == 12) {
      switch (inputType) {
        case "JALALI":
          this.#jalaliMonthListOverridden = true;
          this.#jalaliMonthList = monthList.map(item => item);
          break;
        case "GREGORIAN":
          this.#gregorianMonthListOverridden = true;
          this.#gregorianMonthList = monthList;
      }
      if (this.activeSection == "MONTH") this.#initMonthList();
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
  dateRestrictions: JBCalendarDateRestrictions = new Proxy<JBCalendarDateRestrictions>(
    {
      min: null,
      max: null,
    },
    this.createDateRestrictionHandler(),
  );
  data: JBCalendarData = new Proxy(
    {
      selectedYear: 0,
      selectedMonth: 0,
      yearSelectionRange: [0, 0],
    },
    this.createDataHandler(),
  );
  private elements!: JBCalendarElements;
  get value(): JBCalendarValue {
    return this.#value;
  }
  set value(value: JBCalendarValue | null) {
    if (!value) {
      this.#value = getEmptyValue();
      this.data.selectedMonth = this.#inputType == "GREGORIAN" ? this.#defaultCalendarData.gregorian.month : this.#defaultCalendarData.jalali.month;
      this.data.selectedYear = this.#inputType == "GREGORIAN" ? this.#defaultCalendarData.gregorian.year : this.#defaultCalendarData.jalali.year;
      this.#updateDayDom();
      return;
    }
    const { year, month, day } = value;
    if (year && month && day) {
      this.#value.year = year;
      this.#value.month = month;
      this.#value.day = day;
      if (this.#internals) this.#internals.ariaDescription = `${year}-${month}-${day}`;
      this.data.selectedYear = year;
      this.data.selectedMonth = month;
      this.#updateDayDom();
    } else {
      console.error("Invalid value. please make sure you have year,month and day");
    }
  }
  get activeSection(): JBCalendarSections {
    // determine we want to see day picker or month picker ,...
    return this.#activeSection || "DAY";
  }
  set activeSection(value: JBCalendarSections) {
    if (value == this.#activeSection) {
      return;
    }
    if (this.#activeSection) {
      //if we have active section before
      const selectionType: "day" | "month" | "year" = this.#activeSection.toLocaleLowerCase() as any;
      this.elements.selectionSections[selectionType].classList.remove("--show");
    }

    if (value == "DAY") {
      this.elements.selectionSections.day.classList.add("--show");
      this.elements.navigatorTitle.month.classList.add("--show");
      this.elements.navigatorTitle.year.classList.add("--show");
      this.elements.navigatorTitle.yearRange.classList.remove("--show");
    }
    if (value == "MONTH") {
      this.#initMonthList();
      this.elements.selectionSections.month.classList.add("--show");
      this.elements.navigatorTitle.month.classList.remove("--show");
      this.elements.navigatorTitle.year.classList.add("--show");
      this.elements.navigatorTitle.yearRange.classList.remove("--show");
    }
    if (value == "YEAR") {
      this.#updateYearList();
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
    this.#hasInputTypeOverride = true;
    this.#setInputType(value);
  }
  #setInputType(value: InputType) {
    if (this.#inputType == value && this.isConnected) return;
    this.#inputType = value;
    this.onInputTypeChange();
  }
  #showPersianNumber = i18n.locale.numberingSystem == "arabext";
  get showPersianNumber() {
    return this.#showPersianNumber;
  }
  set showPersianNumber(value: boolean) {
    if (typeof value !== "boolean") {
      console.error("showPersianNumber must be boolean");
      return;
    }
    this.#hasShowPersianNumberOverride = true;
    this.#setShowPersianNumber(value);
  }
  #setShowPersianNumber(value: boolean) {
    if (this.#showPersianNumber == value && this.isConnected) return;
    this.#showPersianNumber = value;
    this.setCalendarData();
  }
  get #effectiveDirection(): Direction {
    return getComputedStyle(this).direction as Direction;
  }
  constructor() {
    super();
    if (typeof this.attachInternals === "function") {
      this.#internals = this.attachInternals();
      this.#internals.role = "group";
      this.#internals.ariaLabel = dictionary.get(i18n, "calendar");
    }
    this.initWebComponent();
    this.initProps();
    this.initCalendar();
  }
  connectedCallback() {
    // standard web component event that called when all of dom is bound
    this.#unsubscribeLocaleChange?.();
    this.#applyLocaleDefaults();
    this.#unsubscribeLocaleChange = i18n.subscribe(() => this.#applyLocaleDefaults());
    this.callOnLoadEvent();
    this.refreshDirection();
  }
  static get observedAttributes() {
    return ["dir"];
  }
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === "dir" && oldValue !== newValue && this.isConnected) {
      this.refreshDirection();
    }
  }
  disconnectedCallback() {
    this.#unsubscribeLocaleChange?.();
    this.#unsubscribeLocaleChange = null;
  }
  #applyLocaleDefaults() {
    if (!this.#jalaliMonthListOverridden) this.#jalaliMonthList = dictionary.get(i18n, "jalaliMonthList");
    if (!this.#gregorianMonthListOverridden) this.#gregorianMonthList = dictionary.get(i18n, "gregorianMonthList");
    if (!this.#hasInputTypeOverride) this.#inputType = i18n.locale.calendar === "persian" ? InputTypes.jalali : InputTypes.gregorian;
    if (!this.#hasShowPersianNumberOverride) this.#showPersianNumber = i18n.locale.numberingSystem === "arabext";
    this.initCalendarLayout();
  }

  #updateDayDom() {
    // deselect prevValue
    const prevSelectedDayDom = this.shadowRoot?.querySelector(`.--selected`)??null;
    if (prevSelectedDayDom !== null) {
      prevSelectedDayDom.classList.remove("--selected");
      prevSelectedDayDom.part.remove("selected-day");
      prevSelectedDayDom.setAttribute("aria-pressed", "false");
    }
    // select current day in value
    const selected = !!this.#value.day && this.data.selectedYear == this.#value.year && this.data.selectedMonth == this.#value.month;
    if (selected) {
      const dayDom: HTMLButtonElement | null = this.shadowRoot!.querySelector(`.day-wrapper[day-number="${this.#value.day}"]`);
      if (dayDom) {
        dayDom.classList.add("--selected");
        dayDom.part.add("selected-day");
        dayDom.setAttribute("aria-pressed", "true");
      }
    }
  }
  initCalendarLayout() {
    this.fillDayOfWeek();
    this.setCalendarData();
  }
  /**
   * Refresh direction-sensitive layout classes from the host's computed direction.
   * Call this after changing direction indirectly through an ancestor or CSS class.
   */
  refreshDirection() {
    const direction = this.#effectiveDirection;
    //TODO: use css `if()` when it become standard
    if (direction == "ltr") {
      this.elements.navigatorTitle.nextButton.classList.add("--css-ltr");
      this.elements.navigatorTitle.prevButton.classList.add("--css-ltr");
      this.elements.monthDayWrapper.next.classList.add("--css-ltr");
      this.elements.monthDayWrapper.prev.classList.add("--css-ltr");
      this.elements.yearsWrapper.next.classList.add("--css-ltr");
      this.elements.yearsWrapper.prev.classList.add("--css-ltr");
    } else if (direction == "rtl") {
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
    const gregorianDayOfWeekArray = dictionary.get(i18n, "gregorianDayOfWeek");
    const jalaliDayOfWeekArray = dictionary.get(i18n, "jalaliDayOfWeek");
    const dayOfWeekArray = this.inputType == InputTypes.jalali ? jalaliDayOfWeekArray : gregorianDayOfWeekArray;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i <= 6; i++) {
      //day of week dom
      const dowDom = document.createElement("div");
      dowDom.classList.add("week-day");
      dowDom.part.add("week-day");
      dowDom.innerHTML = dayOfWeekArray[i];
      fragment.appendChild(dowDom);
    }
    this.elements.dayOfWeekWrapper.replaceChildren(fragment);
  }
  setCalendarData() {
    // we set default value for selected year and month here because we want user config value and min max date ,... in on init so we update our dom and calendar base on them
    this.#isUpdatingCalendarData = true;
    try {
      if (this.inputType == InputTypes.jalali) {
        this.data.selectedYear = this.value.year || this.data.selectedYear || this.#defaultCalendarData.jalali.year;
        this.data.selectedMonth = this.value.month || this.data.selectedMonth || this.#defaultCalendarData.jalali.month;
        this.elements.swipeupSymbol.querySelector(".swipe-up-text")!.textContent = "نمایش سال‌ها";
      } else {
        this.data.selectedYear = this.value.year || this.data.selectedYear || this.#defaultCalendarData.gregorian.year;
        this.data.selectedMonth = this.value.month || this.data.selectedMonth || this.#defaultCalendarData.gregorian.month;
        this.elements.swipeupSymbol.querySelector(".swipe-up-text")!.textContent = "show years";
      }
      this.data.yearSelectionRange = [this.data.selectedYear - 4, this.data.selectedYear + 7];
    } finally {
      this.#isUpdatingCalendarData = false;
    }
    this.elements.navigatorTitle.year.textContent = this.localizeString(this.data.selectedYear.toString());
    this.#updateTitleMonth(this.data.selectedMonth);
    this.elements.navigatorTitle.yearRange.textContent = this.localizeString(`${this.data.yearSelectionRange[0]} - ${this.data.yearSelectionRange[1]}`);
    this.#renderActiveSection();
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
    const shadowRoot = this.attachShadow({ mode: "open", serializable: true, clonable: true });
    registerDefaultVariables();
    const html = `<style>${CSS} ${VariableCSS}</style>\n${renderHTML()}`;
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
    window.matchMedia;
  }
  registerEventHandlers() {
    this.elements.navigatorTitle.nextButton.addEventListener("click", this.onNextButtonClicked.bind(this));
    this.elements.navigatorTitle.prevButton.addEventListener("click", this.onPrevButtonClicked.bind(this));
    this.elements.navigatorTitle.year.addEventListener("click", this.onNavigatorTitleYearClicked.bind(this));
    this.elements.navigatorTitle.month.addEventListener("click", this.onNavigatorTitleMonthClicked.bind(this));
    //add support for swiping
    this.elements.selectionSections.day.addEventListener("touchstart", this.onDayWrapperTouchStart.bind(this));
    this.elements.selectionSections.day.addEventListener("touchmove", this.onDayWrapperTouchMove.bind(this));
    this.elements.selectionSections.day.addEventListener("touchend", this.onDayWrapperTouchEnd.bind(this));
    //swipe for year list
    this.elements.selectionSections.year.addEventListener("touchstart", this.onYearWrapperTouchStart.bind(this));
    this.elements.selectionSections.year.addEventListener("touchmove", this.onYearWrapperTouchMove.bind(this));
    this.elements.selectionSections.year.addEventListener("touchend", this.onYearWrapperTouchEnd.bind(this));
  }
  onDayWrapperTouchStart(e: TouchEvent) {
    this.#fillAdjacentMonthDays();
    this.#swipeGestureData.daysWrapper.startX = e.touches[0].clientX;
    this.#swipeGestureData.daysWrapper.startY = e.touches[0].clientY;
  }
  onDayWrapperTouchMove(e: TouchEvent) {
    if (this.#swipeGestureData.daysWrapper.startX !== null && this.#swipeGestureData.daysWrapper.startY !== null) {
      e.preventDefault();
      const deltaX = e.touches[0].clientX - this.#swipeGestureData.daysWrapper.startX;
      const deltaY = e.touches[0].clientY - this.#swipeGestureData.daysWrapper.startY;
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
        //if user swipe more vertically than horizontally we reset horizontal swipe change
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
            this.elements.swipeupSymbol.style.transform = `translateY(${deltaY + 32}px)`;
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
        //determine direction of change
        let swipeDirection = deltaX > 0 ? "next" : "prev";
        if (this.#effectiveDirection == "ltr") {
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
          this.activeSection = "MONTH";
        } else {
          this.activeSection = "YEAR";
        }
      }
    }
  }

  onYearWrapperTouchStart(e: TouchEvent) {
    this.#swipeGestureData.yearsWrapper.startX = e.touches[0].clientX;
  }
  onYearWrapperTouchMove(e: TouchEvent) {
    e.preventDefault();
    if (this.#swipeGestureData.yearsWrapper.startX !== null) {
      this.elements.yearsWrapper.current.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX}px)`;
      this.elements.yearsWrapper.prev.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX}px)`;
      this.elements.yearsWrapper.next.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX}px)`;
    }
  }
  onYearWrapperTouchEnd(e: TouchEvent) {
    if (this.#swipeGestureData.yearsWrapper.startX !== null) {
      const clientX = e.changedTouches[0].clientX;
      const deltaX = clientX - this.#swipeGestureData.yearsWrapper.startX;
      this.#swipeGestureData.yearsWrapper.startX = null;

      //determine direction of change
      let swipeDirection = deltaX > 0 ? "next" : "prev";
      if (this.#effectiveDirection == "ltr") {
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
      //remove all transform and changed pos from element and returned it to natural place. used on drop event
      dom.style.transition = `transform 0.3s 0s ease`;
      //remove above assigned animation
      setTimeout(() => {
        dom.style.transition = "";
      }, 300);
      dom.style.transform = ``;
    }
  }
  #updateTitleMonth(monthIndex: number) {
    const monthName = this.inputType == InputTypes.jalali ? this.#jalaliMonthList[monthIndex - 1] : this.#gregorianMonthList[monthIndex - 1];
    this.elements.navigatorTitle.month.innerHTML = monthName;
  }
  createDataHandler() {
    const onYearChanged = (newYear: number) => {
      this.elements.navigatorTitle.year.innerHTML = this.localizeString(newYear.toString());
      if (this.activeSection == "MONTH") this.#initMonthList(newYear);
    };
    const onMonthChanged = (newMonth: number) => {
      this.#updateTitleMonth(newMonth);
      this.fillMonthDays();
    };
    const onYearSelectionRangeChanged = (newRange: number[]) => {
      this.elements.navigatorTitle.yearRange.innerHTML = this.localizeString(`${newRange[0]} - ${newRange[1]}`);
      if (this.activeSection == "YEAR") this.#updateYearList([newRange[0], newRange[1]]);
    };
    const dataHandler = {
      set: (obj: any, prop: string, value: number | number[]) => {
        if (prop == "selectedYear") {
          obj[prop] = value;
          if (!this.#isUpdatingCalendarData) onYearChanged(value as number);
        }
        if (prop == "selectedMonth") {
          obj[prop] = value;
          if (!this.#isUpdatingCalendarData) onMonthChanged(value as number);
        }
        if (prop == "yearSelectionRange" && Array.isArray(value)) {
          obj[prop] = value;
          if (!this.#isUpdatingCalendarData) onYearSelectionRangeChanged(value);
        }
        return true;
      },
    };
    return dataHandler;
  }
  createDateRestrictionHandler() {
    const restrictionHandler = {
      set: (obj: any, prop: string, value: Date | null) => {
        obj[prop] = value;
        switch (prop) {
          case "min":
          case "max":
            if (this.activeSection == "DAY") {
              this.fillMonthDays();
            } else if (this.activeSection == "MONTH") {
              this.#initMonthList();
            } else if (this.activeSection == "YEAR") {
              this.#updateYearList();
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
      this.select(getJalaliYear(today), getJalaliMonth(today) + 1, getJalaliDate(today));
    } else {
      this.select(getYear(today), getMonth(today) + 1, getDate(today));
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
      this.activeSection = "DAY";
    }
  }
  #mapGregorianDayOfWeekToJalali(dayNumber: number) {
    // for example sunday is 0 so 2(yekshanbe) will return
    const mapper = [2, 3, 4, 5, 6, 7, 1];
    return mapper[dayNumber];
  }
  #initMonthList(selectedYear = this.data.selectedYear) {
    renderMonthList({
      wrapper: this.elements.selectionSections.month,
      monthList: this.inputType == InputTypes.jalali ? this.#jalaliMonthList : this.#gregorianMonthList,
      isDisabled: monthIndex => this.#isMonthDisabled(selectedYear, monthIndex),
      onSelect: monthIndex => {
        this.data.selectedMonth = monthIndex;
        this.activeSection = "DAY";
      },
    });
  }
  #updateYearList(yearSelectionRange = this.data.yearSelectionRange) {
    renderYearList({
      wrappers: this.elements.yearsWrapper,
      yearSelectionRange,
      localize: year => this.localizeString(year),
      isDisabled: year => this.#isYearDisabled(year),
      onSelect: year => {
        this.data.selectedYear = year;
        this.activeSection = "MONTH";
      },
    });
  }
  #renderActiveSection() {
    if (this.activeSection == "DAY") {
      this.fillMonthDays();
    } else if (this.activeSection == "MONTH") {
      this.#initMonthList();
    } else {
      this.#updateYearList();
    }
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
  #isRangeDisabled(start: Date, end: Date) {
    return Boolean((this.dateRestrictions.min && isBefore(end, this.dateRestrictions.min)) || (this.dateRestrictions.max && isAfter(start, this.dateRestrictions.max)));
  }
  #isMonthDisabled(year: number, month: number) {
    if (!this.dateRestrictions.min && !this.dateRestrictions.max) {
      return false;
    }
    const start = this.#getDate(year, month, 1);
    const end = this.#getDate(year, month, this.#getDaysInMonth(start));
    return this.#isRangeDisabled(start, end);
  }
  #isYearDisabled(year: number) {
    if (!this.dateRestrictions.min && !this.dateRestrictions.max) {
      return false;
    }
    const start = this.#getDate(year, 1, 1);
    const lastMonthStart = this.#getDate(year, 12, 1);
    const end = this.#getDate(year, 12, this.#getDaysInMonth(lastMonthStart));
    return this.#isRangeDisabled(start, end);
  }
  #isToday(day: number, month: number, year: number): boolean {
    const today = new Date();
    if (this.inputType == InputTypes.jalali) {
      return getJalaliYear(today) == year && getJalaliMonth(today) == month - 1 && getJalaliDate(today) == day;
    }
    return getYear(today) == year && getMonth(today) == month - 1 && getDate(today) == day;
  }
  fillMonthDaysDom(year: number, month: number, type: "current" | "prev" | "next") {
    const firstDayOfMonthDate = this.#getDate(year, month, 1);
    // const firstDayInWeek = this.inputType == InputTypes.jalali ? this.mapGregorianDayOfWeekToJalali(firstDayOfMonthDate.day()) : firstDayOfMonthdate.day() + 1;
    const firstDayInWeek = this.#getWeekDayIndex(firstDayOfMonthDate);

    const fragment = document.createDocumentFragment();
    for (let i = 1; i < firstDayInWeek; i++) {
      const emptyDayDom = this.createEmptyDayDom();
      fragment.appendChild(emptyDayDom);
    }
    const dayInMonth = this.#getDaysInMonth(firstDayOfMonthDate);
    for (let i = 1; i <= dayInMonth; i++) {
      const dayDate = this.#getDate(this.data.selectedYear, this.data.selectedMonth, i);
      const isToday = this.#isToday(i, this.data.selectedMonth, this.data.selectedYear);
      const isSelected = this.value.year == this.data.selectedYear && this.value.month == this.data.selectedMonth && this.value.day == i;
      const isDisable = !this.checkIsDayDisable(dayDate).isAllValid;
      const dayDom = createDayDom({
        dayNumber: i,
        year: this.data.selectedYear,
        month: this.data.selectedMonth,
        isToday,
        isSelected,
        isDisable,
        localizedDayNumber: this.localizeString(i.toString()),
        onSelect: (selectedYear, selectedMonth, dayNumber) => this.onDayClicked(selectedYear, selectedMonth, dayNumber),
      });
      fragment.appendChild(dayDom);
    }
    this.elements.monthDayWrapper[type].replaceChildren(fragment);
  }
  fillMonthDays() {
    this.fillMonthDaysDom(this.data.selectedYear, this.data.selectedMonth, "current");
  }
  #fillAdjacentMonthDays() {
    const currentMonth = this.data.selectedMonth;
    const currentYear = this.data.selectedYear;
    //set prev month days
    let prevMonth: number, prevYear: number;
    if (currentMonth > 1) {
      prevMonth = currentMonth - 1;
      prevYear = currentYear;
    } else {
      prevYear = currentYear - 1;
      prevMonth = 12;
    }
    this.fillMonthDaysDom(prevYear, prevMonth, "prev");
    //update next month days
    let nextMonth: number, nextYear: number;
    if (currentMonth < 12) {
      nextMonth = currentMonth + 1;
      nextYear = currentYear;
    } else {
      nextYear = currentYear + 1;
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
      result.min = isAfter(dayDate, this.dateRestrictions.min) || isEqual(dayDate, this.dateRestrictions.min);
    }
    if (this.dateRestrictions.max) {
      result.max = isBefore(dayDate, this.dateRestrictions.max) || isEqual(dayDate, this.dateRestrictions.max);
    }
    return result;
  }
  createEmptyDayDom() {
    const dayDom = document.createElement("div");
    dayDom.setAttribute("aria-hidden", "true");
    dayDom.classList.add("empty-day");
    dayDom.part.add("empty-day");
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
    if (this.activeSection == "DAY" || this.activeSection == "MONTH") {
      this.activeSection = "YEAR";
    }
  }
  onNavigatorTitleMonthClicked() {
    if (this.activeSection == "DAY") {
      this.activeSection = "MONTH";
    }
  }
  onInputTypeChange() {
    // when date input type change this function get called
    this.setCalendarData();
    this.fillDayOfWeek();
  }
  localizeString(string: string): string {
    if (this.showPersianNumber) {
      return enToFaDigits(string);
    } else {
      return string;
    }
  }
}
defineWebComponent("jb-calendar", JBCalendarWebComponent);

declare global {
  interface HTMLElementTagNameMap {
    "jb-calendar": JBCalendarWebComponent;
  }
}
