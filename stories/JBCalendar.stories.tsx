import React, { useState } from 'react';
import { JBCalendar, Props } from 'jb-calendar/react';
import './styles/themes.css';
import type { Meta, StoryObj } from '@storybook/react';
import { addMonths } from 'date-fns';
import type { JBCalendarValue } from 'jb-calendar';
const meta: Meta<Props> = {
  title: "Components/JBCalendar",
  component: JBCalendar,
  args: {
    direction: 'ltr',
  }
};
export default meta;
type Story = StoryObj<typeof JBCalendar>;

export const Normal: Story = {
  args: {
  }
};
export const Jalali: Story = {
  args: {
    inputType: 'JALALI'
  }
};

export const CustomMonthName: Story = {
  args: {
    inputType: 'JALALI',
    jalaliMonthList: ['حَمَل', 'ثَور', 'جَوزا', 'سَرَطان', 'اَسَد', 'سُنبُله', 'میزان', 'عَقرَب', 'قَوس', 'جَدْی', 'دَلو', 'حوت']
  }
};



export const Gregorian: Story = {
  args: {
    inputType: 'GREGORIAN'
  },
};

export const MinMax: Story = {
  args: {
    min: new Date(),
    max: addMonths(new Date(), 2)
  },
};

export const valueTest: Story = {
  render: () => {
    const [selectedValueYear, selectedValueYearSetter] = useState<number|null>(null);
    const [selectedValueMonth, selectedValueMonthSetter] = useState<number|null>(null);
    const [selectedValueDay, selectedValueDaySetter] = useState<number|null>(null);
    function setValue(value:JBCalendarValue) {
      selectedValueYearSetter(value.year);
      selectedValueMonthSetter(value.month);
      selectedValueDaySetter(value.day);
    }
    return (
      <div>
        <JBCalendar onSelect={e => { setValue(e.target.value); }}></JBCalendar>
        <div>
          <br /><br />Your date is: {selectedValueYear} /{selectedValueMonth} /{selectedValueDay}
        </div>
      </div>
    );
  }
};

export const RightToLeft: Story = {
  args: {
    inputType:'JALALI',
    direction: 'rtl',
  },
  parameters: {
    themes: {
      themeOverride: 'rtl'
    }
  },
};
export const RTLGregorian: Story = {
  args: {
    direction: 'rtl',
    inputType: 'GREGORIAN'
  },
  parameters: {
    themes: {
      themeOverride: 'rtl'
    }
  },
};

export const onMobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
};

export const customTheme: Story = {
  args: {
    className: "dark-theme"
  }
}