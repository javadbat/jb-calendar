import { i18n } from "jb-core/i18n";
import { dictionary } from "./i18n";
import 'jb-icons/arrow';
import 'jb-button';

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
