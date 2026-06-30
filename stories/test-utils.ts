import type { JBCalendarWebComponent } from 'jb-calendar';
import { expect } from 'storybook/test';

export function getCalendar(canvasElement: HTMLElement) {
  const calendar = canvasElement.querySelector<JBCalendarWebComponent>('jb-calendar');
  expect(calendar).toBeTruthy();
  expect(calendar!.shadowRoot).toBeTruthy();
  return calendar!;
}

export function getShadow(calendar: JBCalendarWebComponent) {
  return calendar.shadowRoot!;
}

export function getCurrentDays(calendar: JBCalendarWebComponent) {
  return Array.from(getShadow(calendar).querySelectorAll<HTMLElement>('.current-month-day-wrapper .day-wrapper'));
}

export function getDay(calendar: JBCalendarWebComponent, day: number) {
  const dayElement = getShadow(calendar).querySelector<HTMLElement>(`.current-month-day-wrapper .day-wrapper[day-number="${day}"]`);
  expect(dayElement).toBeTruthy();
  return dayElement!;
}

export function getMonthNames(calendar: JBCalendarWebComponent) {
  return Array.from(getShadow(calendar).querySelectorAll<HTMLElement>('.month-selection-section .month-name')).map((month) => month.textContent);
}
