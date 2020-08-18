import HTML from './JBCalendar.html';
import CSS from './JBCalendar.scss';
import dayjs from 'dayjs';
import jalaliday from 'jalaliday';
dayjs.extend(jalaliday);
const jalaliMonthList = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
class JBCalendarWebComponent extends HTMLElement {

    get value() {
        return this._value
    }
    get activeSection() {
        // determine we want to see day picker or month picker ,...
        return this._activeSection;
    }
    set activeSection(value) {
        if (value == this._activeSection) {
            return;
        }
        if (this._activeSection) {
            //if we have active section before
            this._selectionSections[this._activeSection.toLocaleLowerCase()].classList.remove('--show')
        }

        if (value == "DAY") {
            this._selectionSections.day.classList.add('--show');
            this._shadowRoot.querySelector('.navigator-title .month').classList.add('--show');
            this._shadowRoot.querySelector('.navigator-title .year').classList.add('--show');
            this._shadowRoot.querySelector('.navigator-title .year-range').classList.remove('--show');
        }
        if (value == "MONTH") {
            this._selectionSections.month.classList.add('--show');
            this._shadowRoot.querySelector('.navigator-title .month').classList.remove('--show');
            this._shadowRoot.querySelector('.navigator-title .year').classList.add('--show');
            this._shadowRoot.querySelector('.navigator-title .year-range').classList.remove('--show');
        }
        if (value == "YEAR") {
            this._selectionSections.year.classList.add('--show');
            this._shadowRoot.querySelector('.navigator-title .month').classList.remove('--show');
            this._shadowRoot.querySelector('.navigator-title .year').classList.remove('--show');
            this._shadowRoot.querySelector('.navigator-title .year-range').classList.add('--show');
        }
        this._activeSection = value;
    }
    constructor() {
        super();
        this.initWebComponent();
        this.initProps();
        this.initCalendar();
    }
    connectedCallback() {
        // standard web component event that called when all of dom is binded
        // we set defualt value for selected year and month here becuase we want user config value and min max date ,... in on init so we update our dom and calendar base on them
        const today = dayjs();
        const jalaliToday = today.calendar('jalali');
        this.data.selectedYear = this.value.year || jalaliToday.year();
        this.data.selectedMonth = this.value.month || jalaliToday.month() + 1;
        this.data.yearSelectionRange = [this.data.selectedYear - 4, this.data.selectedYear + 7];
        this.callOnLoadEvent();
    }
    callOnLoadEvent() {
        var event = new CustomEvent('load', { bubbles: true, composed: true });
        this.dispatchEvent(event);
    }
    callOnInitEvent() {
        var event = new CustomEvent('init', { bubbles: true, composed: true });
        this.dispatchEvent(event);
    }
    initWebComponent() {
        this._shadowRoot = this.attachShadow({ mode: 'open' });
        this._html = `<style>${CSS}</style>` + '\n' + HTML
        this._element = document.createElement('template');
        this._element.innerHTML = this._html;
        this._shadowRoot.appendChild(this._element.content.cloneNode(true));
        this._selectionSections = {
            day: this._shadowRoot.querySelector('.day-selection-section'),
            month: this._shadowRoot.querySelector('.month-selection-section'),
            year: this._shadowRoot.querySelector('.year-selection-section')
        }
        this._monthDayWrapper = this._selectionSections.day.querySelector('.month-day-wrapper');
        this.registerEventHandlers();
    }
    registerEventHandlers() {
        this._shadowRoot.querySelector('.next-btn').addEventListener('click', this.onNextButtonClicked.bind(this));
        this._shadowRoot.querySelector('.prev-btn').addEventListener('click', this.onPrevButtonClicked.bind(this));
        this._shadowRoot.querySelector('.navigator-title').addEventListener('click', this.onNavigatorTitleClicked.bind(this));
    }
    createDataHandler() {
        const onYearChanged = (newYear, prevYear) => {
            this._shadowRoot.querySelector('.navigator-title .year').innerHTML = newYear;
        }
        const onMonthChanged = (newMonth, prevMonth) => {
            this._shadowRoot.querySelector('.navigator-title .month').innerHTML = jalaliMonthList[newMonth - 1];
            this.fillMonthDays();
        }
        const onYearSelectionRangeChanged = (newRange) => {
            this._shadowRoot.querySelector('.navigator-title .year-range').innerHTML = `${newRange[0]} - ${newRange[1]}`;
            this.fillYearList();
        }
        const dataHandler = {
            set: (obj, prop, value) => {

                if (prop == "selectedYear") {
                    onYearChanged(value, obj.selectedYear);
                    obj[prop] = value;
                }
                if (prop == "selectedMonth") {
                    obj[prop] = value;
                    onMonthChanged(value, obj.selectedMonth);
                }
                if (prop == "yearSelectionRange") {
                    obj[prop] = value
                    onYearSelectionRangeChanged(value)
                }
                return true;
            }
        }
        return dataHandler;
    }
    createDateRestrictionHandler() {
        const restrictionHandler = {
            set: (obj, prop, value) => {
                obj[prop] = value;
                switch (prop) {
                    case 'min':
                        if(this.activeSection == "DAY"){
                            this.fillMonthDays();
                        }
                        break;
                    case 'max':
                        if(this.activeSection == "DAY"){
                            this.fillMonthDays();
                        }
                        break;
                }
                return true;
            }
        }
        return restrictionHandler;
    }
    initProps() {
        this._activeSection = null;
        this.dateRestrictions = new Proxy({
            min: null,
            max: null
        },this.createDateRestrictionHandler());
        this.data = new Proxy({
            selectedYear: 0,
            selectedMonth: 0,
            yearSelectionRange: [0, 0]
        }, this.createDataHandler());
        this._value = {
            year: null,
            month: null,
            day: null
        }
        this.callOnInitEvent();

    }
    selectToday() {
        const today = dayjs();
        const jalaliToday = today.calendar('jalali');
        this.select(jalaliToday.year(), jalaliToday.month() + 1, jalaliToday.date());
    }
    select(year, month, day) {
        this._value.year = year;
        this._value.month = month;
        this._value.day = day;
        this.data.selectedYear = year;
        this.data.selectedMonth = month;
        const prevSelectedDayDom = this._shadowRoot.querySelector(`.--selected`);
        if (prevSelectedDayDom) {
            prevSelectedDayDom.classList.remove('--selected');
        }
        if (this.data.selectedYear == year && this.data.selectedMonth == month) {
            const dayDom = this._shadowRoot.querySelector(`.day-wrapper[day-number="${day}"]`);
            dayDom.classList.add('--selected');
        }
    }
    initCalendar() {
        if (!this.activeSection) {
            this.activeSection = "DAY";
        }
        this.fillMonthList();
    }
    mapgaregorianDayofWeekToJalali(dayNumber) {
        // for example sunday is 0 so 2(yekshanbe) will return
        const mapper = [2, 3, 4, 5, 6, 7, 1];
        return mapper[dayNumber]
    }
    fillYearList() {
        this._selectionSections.year.innerHTML = "";
        for (let i = this.data.yearSelectionRange[0]; i <= this.data.yearSelectionRange[1]; i++) {
            const yearDom = this.createYearDom(i);
            this._selectionSections.year.appendChild(yearDom);
        }
    }
    createYearDom(year) {
        const monthDom = document.createElement('div');
        monthDom.classList.add('year-wrapper');
        const monthTextDom = document.createElement('div');
        monthTextDom.classList.add('year-number');
        monthTextDom.innerHTML = year;
        monthDom.appendChild(monthTextDom);
        monthDom.addEventListener('click', () => {
            this.data.selectedYear = year;
            this.activeSection = 'MONTH';
        });
        return monthDom

    }
    fillMonthList() {
        for (let i = 1; i < 13; i++) {
            const monthDom = this.createMonthDom(i);
            this._selectionSections.month.appendChild(monthDom);
        }
    }
    createMonthDom(monthIndex) {
        const monthDom = document.createElement('div');
        monthDom.classList.add('month-wrapper');
        const monthTextDom = document.createElement('div');
        monthTextDom.classList.add('month-name');
        monthTextDom.innerHTML = jalaliMonthList[monthIndex - 1];
        monthDom.appendChild(monthTextDom);
        monthDom.addEventListener('click', () => {
            this.data.selectedMonth = monthIndex;
            this.activeSection = 'DAY';
        });
        return monthDom

    }
    fillMonthDays() {
        const firstDayOfMonthdate = dayjs(`${this.data.selectedYear}-${this.data.selectedMonth}-1`, { jalali: true });
        const jalaliFirstDayOfMonthdate = firstDayOfMonthdate.calendar('jalali');
        const firstDayInWeek = this.mapgaregorianDayofWeekToJalali(firstDayOfMonthdate.day());
        const today = dayjs();
        const jalaliToday = today.calendar('jalali');

        this._monthDayWrapper.innerHTML = "";
        for (let i = 1; i < firstDayInWeek; i++) {
            const emptyDayDom = this.createEmptyDayDom();
            this._monthDayWrapper.appendChild(emptyDayDom);
        }
        const dayInMonth = jalaliFirstDayOfMonthdate.daysInMonth();
        for (let i = 1; i <= dayInMonth; i++) {
            const dayDate = dayjs(`${this.data.selectedYear}-${this.data.selectedMonth}-${i}`, { jalali: true });
            const isToday = jalaliToday.date() == i && this.data.selectedMonth == jalaliToday.month() + 1 && this.data.selectedYear == jalaliToday.year();
            const isSelected = this.value.year == this.data.selectedYear && this.value.month == this.data.selectedMonth && this.value.day == i;
            const isDisable = !this.checkIsDayDisable(dayDate).isAllValid;
            const dayDom = this.createDayDom(i, this.data.selectedYear, this.data.selectedMonth, isToday, isSelected, isDisable);
            this._monthDayWrapper.appendChild(dayDom);
        }
    }
    checkIsDayDisable(dayDate) {
        const result = {
            min: true,
            max: true,
            get isAllValid() { return this.min && this.max }
        }
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
    createDayDom(dayNumber, year, month, isToday, isSelected, isDisable) {
        //create dom
        const dayDom = document.createElement('div');
        dayDom.classList.add('day-wrapper');
        dayDom.setAttribute('day-number', dayNumber);
        if (isToday) {
            dayDom.classList.add('--today');
        }
        if (isSelected) {
            dayDom.classList.add('--selected');
        }
        const dayNumberDom = document.createElement('div');
        dayNumberDom.classList.add('day-number');
        dayNumberDom.innerHTML = dayNumber;
        const statusPoint = document.createElement('div');
        statusPoint.classList.add('status-point')
        dayDom.appendChild(statusPoint);
        dayDom.appendChild(dayNumberDom);
        if (!isDisable) {
            // add event listeners
            dayDom.addEventListener('click', () => { this.onDayClicked(year, month, dayNumber) })
        } else {
            dayDom.classList.add('--disable')
        }
        return dayDom;

    }
    onDayClicked(year, month, dayNumber) {
        this.select(year, month, dayNumber);
        const event = new CustomEvent('select');
        this.dispatchEvent(event);
    }
    onNextButtonClicked() {
        if (this.activeSection == "DAY") {
            const selectedMonth = this.data.selectedMonth;
            if (selectedMonth < 12) {
                this.data.selectedMonth = selectedMonth + 1
            } else {
                this.data.selectedYear = this.data.selectedYear + 1
                this.data.selectedMonth = 1
            }
        }
        if (this.activeSection == "MONTH") {
            this.data.selectedYear = this.data.selectedYear + 1
        }
        if (this.activeSection == "YEAR") {
            const minYear = this.data.yearSelectionRange[0] + 12
            const maxYear = this.data.yearSelectionRange[1] + 12
            this.data.yearSelectionRange = [minYear, maxYear];
        }

    }
    onPrevButtonClicked() {
        if (this.activeSection == "DAY") {
            const selectedMonth = this.data.selectedMonth;
            if (selectedMonth > 1) {
                this.data.selectedMonth = selectedMonth - 1
            } else {
                this.data.selectedYear = this.data.selectedYear - 1
                this.data.selectedMonth = 12;
            }
        }

        if (this.activeSection == "MONTH") {
            this.data.selectedYear = this.data.selectedYear - 1
        }
        if (this.activeSection == "YEAR") {
            const minYear = this.data.yearSelectionRange[0] - 12
            const maxYear = this.data.yearSelectionRange[1] - 12
            if (minYear > 0) {
                this.data.yearSelectionRange = [minYear, maxYear];
            }
        }
    }
    onNavigatorTitleClicked() {
        if (this.activeSection == "DAY") {
            this.activeSection = "MONTH";
        } else if (this.activeSection == "MONTH") {
            this.activeSection = "YEAR";
        }
    }
}
const myElementNotExists = !customElements.get('jb-calendar');
if (myElementNotExists) {
    window.customElements.define('jb-calendar', JBCalendarWebComponent);
}
