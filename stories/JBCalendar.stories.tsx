import React, { useState } from 'react';
import { JBCalendar } from 'jb-calendar/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { addMonths, getDaysInMonth as getGregorianDaysInMonth } from 'date-fns';
import { getDaysInMonth as getJalaliDaysInMonth, newDate as newJalaliDate } from 'date-fns-jalali';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { JBCalendarValue } from 'jb-calendar';
import { getCalendar, getCurrentDays, getDay, getMonthNames, getShadow } from './test-utils';
const meta = {
  title: "Components/JBCalendar",
  component: JBCalendar,
  args: {
    direction: 'ltr',
  }
} satisfies Meta<typeof JBCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

const jalaliMonthList = ["Farvardin", "Ordibehesht", "Khordad", "Tir", "Mordad", "Shahrivar", "Mehr", "Aban", "Azar", "Dey", "Bahman", "Esfand"];
const gregorianMonthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const customJalaliMonthList = ['حَمَل', 'ثَور', 'جَوزا', 'سَرَطان', 'اَسَد', 'سُنبُله', 'میزان', 'عَقرَب', 'قَوس', 'جَدْی', 'دَلو', 'حوت'];

export const Normal: Story = {
  args: {
  }
};
export const Jalali: Story = {
  args: {
    inputType: 'JALALI'
  },
  play: async ({ canvasElement }) => {
    const calendar = getCalendar(canvasElement);

    await waitFor(() => {
      expect(calendar.inputType).toBe('JALALI');
      expect(jalaliMonthList).toContain(getShadow(calendar).querySelector('.navigator-title .month')?.textContent);
      expect(getCurrentDays(calendar)).toHaveLength(getJalaliDaysInMonth(newJalaliDate(calendar.data.selectedYear, calendar.data.selectedMonth - 1, 1)));
    });
  }
};

export const CustomMonthName: Story = {
  args: {
    inputType: 'JALALI',
    jalaliMonthList: customJalaliMonthList
  },
  play: async ({ canvasElement }) => {
    const calendar = getCalendar(canvasElement);
    const shadow = getShadow(calendar);

    await userEvent.click(shadow.querySelector<HTMLElement>('.navigator-title .month')!);

    await waitFor(() => {
      expect(shadow.querySelector('.month-selection-section')?.classList.contains('--show')).toBe(true);
      expect(getMonthNames(calendar)).toEqual(customJalaliMonthList);
    });
  }
};



export const Gregorian: Story = {
  args: {
    inputType: 'GREGORIAN'
  },
  play: async ({ canvasElement }) => {
    const calendar = getCalendar(canvasElement);
    const shadow = getShadow(calendar);

    await waitFor(() => {
      expect(calendar.inputType).toBe('GREGORIAN');
      expect(gregorianMonthList).toContain(shadow.querySelector('.navigator-title .month')?.textContent);
    });

    await userEvent.click(shadow.querySelector<HTMLElement>('.navigator-title .month')!);

    await waitFor(() => {
      expect(getMonthNames(calendar)).toEqual(gregorianMonthList);
    });

    calendar.data.selectedYear = 2024;
    calendar.data.selectedMonth = 2;

    await waitFor(() => {
      expect(getCurrentDays(calendar)).toHaveLength(getGregorianDaysInMonth(new Date(2024, 1, 1)));
    });

    calendar.data.selectedYear = 2023;
    calendar.data.selectedMonth = 2;

    await waitFor(() => {
      expect(getCurrentDays(calendar)).toHaveLength(getGregorianDaysInMonth(new Date(2023, 1, 1)));
    });

    await userEvent.click(shadow.querySelector<HTMLElement>('.navigator-title .year')!);

    await waitFor(() => {
      const years = Array.from(shadow.querySelectorAll<HTMLElement>('.current-years-wrapper .year-number')).map((year) => year.textContent);
      expect(years).toEqual(Array.from({ length: 12 }, (_, index) => String(calendar.data.yearSelectionRange[0] + index)));
    });
  }
};

export const MinMax: Story = {
  args: {
    min: new Date(),
    max: addMonths(new Date(), 2)
  },
  play: async ({ canvasElement }) => {
    const calendar = getCalendar(canvasElement);

    calendar.inputType = 'GREGORIAN';
    calendar.data.selectedYear = 2024;
    calendar.data.selectedMonth = 1;
    calendar.dateRestrictions.min = new Date(2024, 0, 10);
    calendar.dateRestrictions.max = new Date(2024, 0, 20);

    await waitFor(() => {
      expect(getDay(calendar, 9).classList.contains('--disable')).toBe(true);
      expect(getDay(calendar, 10).classList.contains('--disable')).toBe(false);
      expect(getDay(calendar, 21).classList.contains('--disable')).toBe(true);
    });

    await userEvent.click(getDay(calendar, 9));

    expect(calendar.value).toEqual({ year: null, month: null, day: null });

    await userEvent.click(getDay(calendar, 10));

    await waitFor(() => {
      expect(calendar.value).toEqual({ year: 2024, month: 1, day: 10 });
    });

    calendar.dateRestrictions.min = new Date(2024, 0, 5);

    await waitFor(() => {
      expect(getDay(calendar, 9).classList.contains('--disable')).toBe(false);
    });
  }
};

export const valueTest: Story = {
  render: () => {
    const [selectedValueYear, selectedValueYearSetter] = useState<number | null>(null);
    const [selectedValueMonth, selectedValueMonthSetter] = useState<number | null>(null);
    const [selectedValueDay, selectedValueDaySetter] = useState<number | null>(null);
    function setValue(value: JBCalendarValue) {
      selectedValueYearSetter(value.year);
      selectedValueMonthSetter(value.month);
      selectedValueDaySetter(value.day);
    }
    return (
      <div>
        <JBCalendar onSelect={e => { setValue(e.target.value); }}></JBCalendar>
        <div>
          <br /><br />Your date is:<b data-testid='displayDate'>{selectedValueYear} /{selectedValueMonth} /{selectedValueDay}</b> 
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const calendar = getCalendar(canvasElement);

    await userEvent.click(getDay(calendar, 15));

    await waitFor(() => {
      expect(canvas.getByTestId('displayDate').textContent).toBe(`${calendar.value.year} /${calendar.value.month} /${calendar.value.day}`);
    });
  }
};

export const RightToLeft: Story = {
  args: {
    inputType: 'JALALI',
    direction: 'rtl',
  },
  globals: {
    locale: "fa",
    dir: "rtl"
  },
};
export const RTLGregorian: Story = {
  args: {
    direction: 'rtl',
    inputType: 'GREGORIAN'
  },
  globals: {
    locale: "fa",
    dir: "rtl"
  },
};

export const onMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile2'
    }
  },
};
