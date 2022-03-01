import HTML from './JBCalendar.html';
import CSS from './JBCalendar.scss';
import { JBCalendarData, JBCalendarDateRestrictions, JBCalendarElements, JBCalendarSwipeGestureData, JBCalendarValue } from './Types';
import dayjs, { Dayjs } from 'dayjs';
import jalaliday from 'jalaliday';


type JalaliDayjs = typeof dayjs & { calendar(calendarType: string): Dayjs; }


if (typeof (dayjs as JalaliDayjs).calendar !== "function") {
    dayjs.extend(jalaliday);
}

const JalaliMonthList = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const GregorianMonthList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const InputTypes = {
    jalali: 'JALALI',
    gregorian: 'GREGORIAN'
};
export enum JBCalendarSections {
    day = 'DAY',
    month = 'MONTH',
    year = 'YEAR'
}
const today = dayjs();
const jalaliToday = today.calendar('jalali');
export class JBCalendarWebComponent extends HTMLElement {
    #swipeGestureData: JBCalendarSwipeGestureData = {
        daysWrapper: {
            startX: null,
            startY: null,
        },
        yearsWrapper: {
            startX: null,
        }
    }
    #value: JBCalendarValue = {
        year: null,
        month: null,
        day: null
    };
    #activeSection: JBCalendarSections | null = null;
    #inputType: string = InputTypes.jalali;
    #defaultCalendarData = {
        jalali:{
            year:jalaliToday.year(),
            month:jalaliToday.month() + 1,
        },
        gregorian:{
            year:today.year(),
            month:today.month() + 1,
        }
    }
    get defaultCalendarData() {
        return this.#defaultCalendarData;
    }
    set defaultCalendarData(value){
        this.#defaultCalendarData = value;
    }
    dateRestrictions: JBCalendarDateRestrictions = new Proxy<JBCalendarDateRestrictions>({
        min: null,
        max: null
    }, this.createDateRestrictionHandler());
    data: JBCalendarData = new Proxy({
        selectedYear: 0,
        selectedMonth: 0,
        yearSelectionRange: [0, 0]
    }, this.createDataHandler());;
    private elements!: JBCalendarElements;
    get value() {
        return this.#value;
    }
    set value(value:JBCalendarValue){
        const {year,month,day} = value;
        if(year && month && day){
            this.#value.year = year;
            this.#value.month = month;
            this.#value.day = day;
            this.data.selectedYear = year;
            this.data.selectedMonth = month;
            const prevSelectedDayDom:(HTMLDivElement | null )= this.shadowRoot!.querySelector(`.--selected`);
            if (prevSelectedDayDom !== null) {
                prevSelectedDayDom.classList.remove('--selected');
            }
            if (this.data.selectedYear == year && this.data.selectedMonth == month) {
                const dayDom = this.shadowRoot!.querySelector(`.day-wrapper[day-number="${day}"]`);
                if(dayDom){
                    dayDom.classList.add('--selected');
                }
            }
        }else{
            console.error('Invalid value. please make sure you have year,month and day');
        }
    }
    get activeSection():JBCalendarSections{
        // determine we want to see day picker or month picker ,...
        return this.#activeSection || JBCalendarSections.day;
    }
    set activeSection(value:JBCalendarSections) {
        if (value == this.#activeSection) {
            return;
        }
        if (this.#activeSection) {
            //if we have active section before
            this.elements.selectionSections[this.#activeSection.toLocaleLowerCase()].classList.remove('--show');
        }

        if (value == "DAY") {
            this.elements.selectionSections.day.classList.add('--show');
            this.elements.navigatorTitle.month.classList.add('--show');
            this.elements.navigatorTitle.year.classList.add('--show');
            this.elements.navigatorTitle.yearRange.classList.remove('--show');
        }
        if (value == "MONTH") {
            this.elements.selectionSections.month.classList.add('--show');
            this.elements.navigatorTitle.month.classList.remove('--show');
            this.elements.navigatorTitle.year.classList.add('--show');
            this.elements.navigatorTitle.yearRange.classList.remove('--show');
        }
        if (value == "YEAR") {
            this.elements.selectionSections.year.classList.add('--show');
            this.elements.navigatorTitle.month.classList.remove('--show');
            this.elements.navigatorTitle.year.classList.remove('--show');
            this.elements.navigatorTitle.yearRange.classList.add('--show');
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
    constructor() {
        super();
        this.initWebComponent();
        this.initProps();
        this.initCalendar();
    }
    connectedCallback() {
        // standard web component event that called when all of dom is binded
        this.fillDayOfWeek();
        this.setCalendarData();
        this.callOnLoadEvent();
    }
    fillDayOfWeek() {
        //fill day of week bas on input type
        const gregorianDayOfWeekArray = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        const jalaliDayOfWeekArray = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
        const dayOfWeekArray = this.inputType == InputTypes.jalali ? jalaliDayOfWeekArray : gregorianDayOfWeekArray;
        this.elements.dayOfWeekWrapper.innerHTML = '';
        for (let i = 0; i <= 6; i++) {
            //day of week dom
            const dowDom = document.createElement('div');
            dowDom.classList.add('week-day');
            dowDom.innerHTML = dayOfWeekArray[i];
            this.elements.dayOfWeekWrapper.appendChild(dowDom);
        }
    }
    setCalendarData() {
        // we set default value for selected year and month here becuase we want user config value and min max date ,... in on init so we update our dom and calendar base on them

        if (this.inputType == InputTypes.jalali) {
            this.data.selectedYear = this.value.year || this.#defaultCalendarData.jalali.year;
            this.data.selectedMonth = this.value.month || this.#defaultCalendarData.jalali.month;
            this.data.yearSelectionRange = [this.data.selectedYear - 4, this.data.selectedYear + 7];
        } else {
            this.data.selectedYear = this.value.year || this.#defaultCalendarData.gregorian.year;
            this.data.selectedMonth = this.value.month || this.#defaultCalendarData.gregorian.month;
            this.data.yearSelectionRange = [this.data.selectedYear - 4, this.data.selectedYear + 7];
        }

    }
    callOnLoadEvent() {
        const event = new CustomEvent('load', { bubbles: true, composed: true });
        this.dispatchEvent(event);
    }
    callOnInitEvent() {
        const event = new CustomEvent('init', { bubbles: true, composed: true });
        this.dispatchEvent(event);
    }
    initWebComponent() {
        const shadowRoot = this.attachShadow({ mode: 'open' });
        const html = `<style>${CSS}</style>` + '\n' + HTML;
        const element = document.createElement('template');
        element.innerHTML = html;
        shadowRoot.appendChild(element.content.cloneNode(true));
        this.elements = {
            selectionSections: {
                day: shadowRoot.querySelector('.day-selection-section')!,
                month: shadowRoot.querySelector('.month-selection-section')!,
                year: shadowRoot.querySelector('.year-selection-section')!
            },
            monthDayWrapper: {
                current: shadowRoot.querySelector('.current-month-day-wrapper')!,
                prev: shadowRoot.querySelector('.prev-month-day-wrapper')!,
                next: shadowRoot.querySelector('.next-month-day-wrapper')!,
            },
            yearsWrapper: {
                current: shadowRoot.querySelector('.current-years-wrapper')!,
                prev: shadowRoot.querySelector('.prev-years-wrapper')!,
                next: shadowRoot.querySelector('.next-years-wrapper')!,
            },
            dayOfWeekWrapper: shadowRoot.querySelector('.week-day-wrapper')!,
            navigatorTitle: {
                month: shadowRoot.querySelector('.navigator-title .month')!,
                year: shadowRoot.querySelector('.navigator-title .year')!,
                yearRange: shadowRoot.querySelector('.navigator-title .year-range')!,
                nextButton: shadowRoot.querySelector('.next-btn')!,
                prevButton: shadowRoot.querySelector('.prev-btn')!,
                wrapper: shadowRoot.querySelector('.navigator-title')!,
            }
        };
        this.registerEventHandlers();
    }
    registerEventHandlers() {
        this.elements.navigatorTitle.nextButton.addEventListener('click', this.onNextButtonClicked.bind(this));
        this.elements.navigatorTitle.prevButton.addEventListener('click', this.onPrevButtonClicked.bind(this));
        this.elements.navigatorTitle.wrapper.addEventListener('click', this.onNavigatorTitleClicked.bind(this));
        //add support for swiping
        this.elements.selectionSections.day.addEventListener('touchstart', this.onDayWrapperTouchStart.bind(this));
        this.elements.selectionSections.day.addEventListener('touchmove', this.onDayWrapperTouchMove.bind(this));
        this.elements.selectionSections.day.addEventListener('touchend', this.onDayWrapperTouchEnd.bind(this));
        //swipe for year list
        this.elements.selectionSections.year.addEventListener('touchstart', this.onYearWrapperTouchStart.bind(this));
        this.elements.selectionSections.year.addEventListener('touchmove', this.onYearWrapperTouchMove.bind(this));
        this.elements.selectionSections.year.addEventListener('touchend', this.onYearWrapperTouchEnd.bind(this));
    }
    onDayWrapperTouchStart(e: TouchEvent) {
        this.#swipeGestureData.daysWrapper.startX = e.touches[0].clientX;
        this.#swipeGestureData.daysWrapper.startY = e.touches[0].clientY;
    }
    onDayWrapperTouchMove(e: TouchEvent) {
        if (this.#swipeGestureData.daysWrapper.startX !== null) {
            e.preventDefault();
            this.elements.monthDayWrapper.current.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.daysWrapper.startX}px)`;
            this.elements.monthDayWrapper.prev.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.daysWrapper.startX}px)`;
            this.elements.monthDayWrapper.next.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.daysWrapper.startX}px)`;
        }
        if (this.#swipeGestureData.daysWrapper.startY !== null) {
            e.preventDefault();
        }
    }
    onDayWrapperTouchEnd(e: TouchEvent) {
        //handle horizental swipe
        if (this.#swipeGestureData.daysWrapper.startX !== null) {
            const clientX = e.changedTouches[0].clientX;
            const deltaX = clientX - this.#swipeGestureData.daysWrapper.startX;
            this.#swipeGestureData.daysWrapper.startX = null;
            if (Math.abs(deltaX) > 100) {
                if (deltaX > 0) {
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
            if (Math.abs(deltaY) > 100) {
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

            this.elements.yearsWrapper.current.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX}px)`;
            this.elements.yearsWrapper.prev.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX}px)`;
            this.elements.yearsWrapper.next.style.transform = `translateX(${e.touches[0].clientX - this.#swipeGestureData.yearsWrapper.startX}px)`;
        }
    }
    onYearWrapperTouchEnd(e:TouchEvent) {
        if(this.#swipeGestureData.yearsWrapper.startX !== null) {
            const clientX = e.changedTouches[0].clientX;
            const deltaX = clientX - this.#swipeGestureData.yearsWrapper.startX;
            this.#swipeGestureData.yearsWrapper.startX = null;
            if (Math.abs(deltaX) > 100) {
                if (deltaX > 0) {
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
    moveBackToPos(dom:HTMLElement) {
        if (dom) {
            //remove all transform and changed pos from element and returned it to natrual place. used on drop event
            dom.style.transition = `transform 0.3s 0s ease`;
            //remove above assigned animation
            setTimeout(() => { dom.style.transition = ''; }, 300);
            dom.style.transform = ``;
        }

    }
    createDataHandler() {
        const onYearChanged = (newYear:number, prevYear:number) => {
            this.elements.navigatorTitle.year.innerHTML = newYear.toString();
        };
        const onMonthChanged = (newMonth:number, prevMonth:number) => {
            const monthName = this.inputType == InputTypes.jalali ? JalaliMonthList[newMonth - 1] : GregorianMonthList[newMonth - 1];
            this.elements.navigatorTitle.month.innerHTML = monthName;
            this.fillMonthDays();
        };
        const onYearSelectionRangeChanged = (newRange:number[]) => {
            this.elements.navigatorTitle.yearRange.innerHTML = `${newRange[0]} - ${newRange[1]}`;
            this.fillYearList();
        };
        const dataHandler = {
            set: (obj:any, prop:string, value:number|number[]) => {

                if (prop == "selectedYear") {
                    onYearChanged(value as number, obj.selectedYear);
                    obj[prop] = value;
                }
                if (prop == "selectedMonth") {
                    obj[prop] = value;
                    onMonthChanged((value as number), obj.selectedMonth);
                }
                if (prop == "yearSelectionRange") {
                    obj[prop] = value;
                    onYearSelectionRangeChanged((value as number[]));
                }
                return true;
            }
        };
        return dataHandler;
    }
    createDateRestrictionHandler() {
        const restrictionHandler = {
            set: (obj:any, prop:string, value:number) => {
                obj[prop] = value;
                switch (prop) {
                    case 'min':
                        if (this.activeSection == "DAY") {
                            this.fillMonthDays();
                        }
                        break;
                    case 'max':
                        if (this.activeSection == "DAY") {
                            this.fillMonthDays();
                        }
                        break;
                }
                return true;
            }
        };
        return restrictionHandler;
    }
    initProps() {
        //default input type of this component is jalali
        this.callOnInitEvent();
    }
    selectToday() {
        const today = dayjs();
        const jalaliToday = today.calendar('jalali');
        if (this.inputType == InputTypes.jalali) {
            this.select(jalaliToday.year(), jalaliToday.month() + 1, jalaliToday.date());
        } else {
            this.select(today.year(), today.month() + 1, today.date());
        }

    }
    select(year:number, month:number, day:number) {
        this.value = {
            year: year,
            month: month,
            day: day
        };
    }
    initCalendar() {
        if (!this.#activeSection) {
            this.activeSection = JBCalendarSections.day;
        }
        this.fillMonthList();
    }
    mapgaregorianDayofWeekToJalali(dayNumber:number) {
        // for example sunday is 0 so 2(yekshanbe) will return
        const mapper = [2, 3, 4, 5, 6, 7, 1];
        return mapper[dayNumber];
    }
    fillYearList() {
        this.fillYearListDom(this.data.yearSelectionRange[0], this.data.yearSelectionRange[1], 'current');
        this.fillYearListDom(this.data.yearSelectionRange[0] - 12, this.data.yearSelectionRange[1] - 12, 'prev');
        this.fillYearListDom(this.data.yearSelectionRange[0] + 12, this.data.yearSelectionRange[1] + 12, 'next');
    }
    fillYearListDom(startYear:number, endYear:number, type:string) {
        this.elements.yearsWrapper[type].innerHTML = "";
        for (let i = startYear; i <= endYear; i++) {
            const yearDom = this.createYearDom(i);
            this.elements.yearsWrapper[type].appendChild(yearDom);
        }
    }
    createYearDom(year:number) {
        const monthDom = document.createElement('div');
        monthDom.classList.add('year-wrapper');
        const monthTextDom = document.createElement('div');
        monthTextDom.classList.add('year-number');
        monthTextDom.innerHTML = year.toString();
        monthDom.appendChild(monthTextDom);
        monthDom.addEventListener('click', () => {
            this.data.selectedYear = year;
            this.activeSection = JBCalendarSections.month;
        });
        return monthDom;

    }
    fillMonthList() {
        this.elements.selectionSections.month.innerHTML = '';
        for (let i = 1; i < 13; i++) {
            const monthDom = this.createMonthDom(i);
            this.elements.selectionSections.month.appendChild(monthDom);
        }
    }
    createMonthDom(monthIndex:number) {
        const monthDom = document.createElement('div');
        monthDom.classList.add('month-wrapper');
        const monthTextDom = document.createElement('div');
        monthTextDom.classList.add('month-name');
        const monthName = this.inputType == InputTypes.jalali ? JalaliMonthList[monthIndex - 1] : GregorianMonthList[monthIndex - 1];
        monthTextDom.innerHTML = monthName;
        monthDom.appendChild(monthTextDom);
        monthDom.addEventListener('click', () => {
            this.data.selectedMonth = monthIndex;
            this.activeSection = JBCalendarSections.day;
        });
        return monthDom;

    }
    fillMonthDaysDom(year: number, month: number, type: string) {
        const firstDayOfMonthdate = (dayjs as any)(`${year}-${month}-1`, { jalali: this.inputType == InputTypes.jalali });
        const jalaliFirstDayOfMonthdate = firstDayOfMonthdate.calendar('jalali');
        const firstDayInWeek = this.inputType == InputTypes.jalali ? this.mapgaregorianDayofWeekToJalali(firstDayOfMonthdate.day()) : firstDayOfMonthdate.day() + 1;
        const gregorianToday = dayjs();
        const jalaliToday = gregorianToday.calendar('jalali');
        const today = this.inputType == InputTypes.jalali ? jalaliToday : gregorianToday;
        this.elements.monthDayWrapper[type].innerHTML = "";
        for (let i = 1; i < firstDayInWeek; i++) {
            const emptyDayDom = this.createEmptyDayDom();
            this.elements.monthDayWrapper[type].appendChild(emptyDayDom);
        }
        const dayInMonth = this.inputType == InputTypes.jalali ? jalaliFirstDayOfMonthdate.daysInMonth() : firstDayOfMonthdate.daysInMonth();
        for (let i = 1; i <= dayInMonth; i++) {
            const dayDate = (dayjs as any)(`${this.data.selectedYear}-${this.data.selectedMonth}-${i}`, { jalali: this.inputType == InputTypes.jalali });
            const isToday = today.date() == i && this.data.selectedMonth == today.month() + 1 && this.data.selectedYear == today.year();
            const isSelected = this.value.year == this.data.selectedYear && this.value.month == this.data.selectedMonth && this.value.day == i;
            const isDisable = !this.checkIsDayDisable(dayDate).isAllValid;
            const dayDom = this.createDayDom(i, this.data.selectedYear, this.data.selectedMonth, isToday, isSelected, isDisable);
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
        this.fillMonthDaysDom(prevYear, prevMonth, 'prev');
        //update current month days
        this.fillMonthDaysDom(currentYear, currentMonth, 'current');
        //update next month days
        let nextMonth: number, nextYear: number;
        if (currentMonth < 12) {
            nextMonth = currentMonth + 1;
            nextYear = this.data.selectedYear;
        } else {
            nextYear = this.data.selectedYear + 1;
            nextMonth = 1;
        }
        this.fillMonthDaysDom(nextYear, nextMonth, 'next');
    }
    checkIsDayDisable(dayDate: dayjs.Dayjs) {
        const result = {
            min: true,
            max: true,
            get isAllValid() { return this.min && this.max; }
        };
        if (this.dateRestrictions.min) {
            result.min = dayDate.isAfter(this.dateRestrictions.min) || dayDate.isSame(this.dateRestrictions.min);
        }
        if (this.dateRestrictions.max) {
            result.max = dayDate.isBefore(this.dateRestrictions.max) || dayDate.isSame(this.dateRestrictions.max);
        }
        return result;
    }
    createEmptyDayDom() {
        const dayDom = document.createElement('div');
        dayDom.classList.add('empty-day');
        return dayDom;
    }
    createDayDom(dayNumber: number, year: number, month: number, isToday: boolean, isSelected: boolean, isDisable: boolean) {
        //create dom
        const dayDom = document.createElement('div');
        dayDom.classList.add('day-wrapper');
        dayDom.setAttribute('day-number', dayNumber.toString());
        if (isToday) {
            dayDom.classList.add('--today');
        }
        if (isSelected) {
            dayDom.classList.add('--selected');
        }
        //
        const dayNumberWrapperDom = document.createElement('div');
        dayNumberWrapperDom.classList.add('day-number-wrapper');
        //
        const dayNumberDom = document.createElement('div');
        dayNumberDom.classList.add('day-number');
        dayNumberDom.innerHTML = dayNumber.toString();
        const statusPoint = document.createElement('div');
        statusPoint.classList.add('status-point');
        //
        dayNumberWrapperDom.appendChild(dayNumberDom);
        dayDom.appendChild(statusPoint);
        dayDom.appendChild(dayNumberWrapperDom);
        if (!isDisable) {
            // add event listeners
            dayDom.addEventListener('click', () => { this.onDayClicked(year, month, dayNumber); });
        } else {
            dayDom.classList.add('--disable');
        }
        return dayDom;

    }
    onDayClicked(year:number, month:number, dayNumber:number) {
        this.select(year, month, dayNumber);
        const event = new CustomEvent('select');
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
    onNavigatorTitleClicked() {
        if (this.activeSection == JBCalendarSections.day) {
            this.activeSection = JBCalendarSections.month;
        } else if (this.activeSection == JBCalendarSections.month) {
            this.activeSection = JBCalendarSections.year;
        }
    }
    onInputTypeChange() {
        // when date input type change this function get called
        this.setCalendarData();
        this.fillDayOfWeek();
        this.fillMonthList();
    }
}
const myElementNotExists = !customElements.get('jb-calendar');
if (myElementNotExists) {
    window.customElements.define('jb-calendar', JBCalendarWebComponent);
}
