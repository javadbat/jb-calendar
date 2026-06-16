# jb-calendar

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/jb-calendar)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://raw.githubusercontent.com/javadbat/jb-calendar/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/jb-calendar)](https://www.npmjs.com/package/jb-calendar)
![GitHub Created At](https://img.shields.io/github/created-at/javadbat/jb-calendar)

Jalali and Gregorian calendar interface web component.

- Supports Jalali and Gregorian date selection.
- Supports day, month, and year selection views.
- Supports min/max date restrictions.
- Supports Persian digit rendering.
- Supports RTL and LTR layout.
- Customizable with CSS variables.

## When to use

Use `jb-calendar` when you need an inline calendar picker UI.

Use [`jb-date-input`](https://github.com/javadbat/jb-date-input) when you need a full date input field with label, validation, text entry, and form input behavior.

## Demo

- [Storybook](https://javadbat.github.io/design-system/?path=/docs/components-jbcalendar)
- [CodePen](https://codepen.io/javadbat/pen/poRKYEY)

## Using With JS Frameworks

- [<img src="https://img.shields.io/badge/React.js-jb--calendar%2Freact-000.svg?logo=react&logoColor=%2361DAFB" height="30" />](https://github.com/javadbat/jb-calendar/tree/main/react)

## Installation

```sh
npm install jb-calendar
```

```js
import 'jb-calendar';
```

```html
<jb-calendar></jb-calendar>
```

## API reference

### Attributes

`jb-calendar` does not currently define public HTML attributes. Configure it with properties and methods.

### Properties

| name | type | readonly | description |
| --- | --- | --- | --- |
| `value` | `JBCalendarValue` | no | Selected date in the active `inputType`. Set `year`, `month`, and `day` together. |
| `inputType` | `'JALALI' \| 'GREGORIAN'` | no | Calendar date system used for input and displayed values. |
| `activeSection` | `'DAY' \| 'MONTH' \| 'YEAR'` | no | Visible selection section. |
| `showPersianNumber` | `boolean` | no | Renders numbers with Persian digits when `true`. |
| `direction` | `'rtl' \| 'ltr'` | no | Calendar layout direction. Leave unset to use computed CSS direction. |
| `cssDirection` | `'rtl' \| 'ltr'` | yes | Computed CSS direction of the host. |
| `defaultCalendarData` | `{ jalali, gregorian }` | no | Default visible year/month used when no date is selected. |
| `dateRestrictions` | `{ min: Date \| null; max: Date \| null }` | no | Mutable min/max date restriction object. Set `dateRestrictions.min` and `dateRestrictions.max`. |
| `data` | `JBCalendarData` | no | Internal visible calendar state: `selectedYear`, `selectedMonth`, and `yearSelectionRange`. |

```ts
type JBCalendarValue = {
  year: number | null;
  month: number | null;
  day: number | null;
};
```

### Methods

| name | returns | description |
| --- | --- | --- |
| `select(year, month, day)` | `void` | Selects a date in the current `inputType` and updates `value`. |
| `selectToday()` | `void` | Selects today in the current `inputType`. |
| `setMonthList(inputType, monthList)` | `void` | Replaces the 12 month labels for `JALALI` or `GREGORIAN`. |
| `setupStyleBaseOnCssDirection(dir?)` | `void` | Refreshes direction-sensitive layout classes from `dir` or computed host direction. |
| `checkIsDayDisable(dayDate)` | `{ min; max; isAllValid }` | Checks whether a `Date` is valid against min/max restrictions. |

### Events

| event | detail | description |
| --- | --- | --- |
| `init` | none | Dispatched during construction after default properties are initialized. |
| `load` | none | Dispatched from `connectedCallback` before layout initialization. |
| `select` | none | Dispatched when the user selects an enabled day. Read `event.target.value`. |

```js
const calendar = document.querySelector('jb-calendar');

calendar.addEventListener('select', (event) => {
  console.log(event.target.value);
});
```

## Select a date

```js
const calendar = document.querySelector('jb-calendar');

calendar.select(1402, 8, 24);
console.log(calendar.value); // { year: 1402, month: 8, day: 24 }
```

You can also set `value` directly:

```js
calendar.value = {
  year: 2026,
  month: 6,
  day: 16,
};
```

## Jalali and Gregorian input

Set `inputType` to `JALALI` or `GREGORIAN`.

```js
const calendar = document.querySelector('jb-calendar');

calendar.inputType = 'GREGORIAN';
calendar.select(2026, 6, 16);
```

## Default visible month

`defaultCalendarData` controls the year and month shown before the user selects a date.

```js
document.querySelector('jb-calendar').defaultCalendarData = {
  gregorian: {
    year: 2026,
    month: 6,
  },
  jalali: {
    year: 1405,
    month: 3,
  },
};
```

## Persian numbers

```js
document.querySelector('jb-calendar').showPersianNumber = true;
```

## Min and max restrictions

Set restrictions with JavaScript `Date` objects. The dates are compared against the currently rendered date system internally.

```js
const calendar = document.querySelector('jb-calendar');

calendar.dateRestrictions.min = new Date(2026, 0, 1);
calendar.dateRestrictions.max = new Date(2026, 11, 31);
```

## Change month labels

Use `setMonthList` with exactly 12 labels.

```js
const calendar = document.querySelector('jb-calendar');

calendar.setMonthList('JALALI', [
  'حمل',
  'ثور',
  'جوزا',
  'سرطان',
  'اسد',
  'سنبله',
  'میزان',
  'عقرب',
  'قوس',
  'جدی',
  'دلو',
  'حوت',
]);

calendar.setMonthList('GREGORIAN', [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
]);
```

## Direction

The component reads CSS direction when it mounts. If your app changes direction after mount, call `setupStyleBaseOnCssDirection()` or set `direction`.

```js
const calendar = document.querySelector('jb-calendar');

calendar.setupStyleBaseOnCssDirection();
calendar.setupStyleBaseOnCssDirection('ltr');
calendar.direction = 'rtl';
```

## Slots and CSS parts

`jb-calendar` does not currently expose public slots or CSS parts.

## Custom style

Set CSS variables in the parent scope of the component.

| CSS variable name | description |
| --- | --- |
| `--jb-calendar-color` | General text color. |
| `--jb-calendar-arrow-button-bgcolor` | Navigator arrow button background color. |
| `--jb-calendar-arrow-button-border-radius` | Navigator arrow button border radius. |
| `--jb-calendar-arrow-fill-color` | Navigator arrow icon color. |
| `--jb-calendar-day-text-color` | Normal day text color. |
| `--jb-calendar-day-text-color-disabled` | Disabled day text color. |
| `--jb-calendar-day-text-color-today` | Today day text color. |
| `--jb-calendar-day-bgcolor-selected` | Selected day background color. |
| `--jb-calendar-day-color-selected` | Selected day text color. |
| `--jb-calendar-day-bgcolor-selected-hover` | Selected day hover background color. |
| `--jb-calendar-day-color-selected-hover` | Selected day hover text color. |
| `--jb-calendar-day-bgcolor-hover` | Day hover background color. |
| `--jb-calendar-day-color-hover` | Day hover text color. |
| `--jb-calendar-day-button-border-radius` | Day button border radius. |
| `--jb-calendar-status-point-bgcolor-today` | Today status point background color. |
| `--jb-calendar-status-point-border-color` | Today status point border color. |
| `--jb-calendar-month-bgcolor-hover` | Month hover background color. |
| `--jb-calendar-month-color-hover` | Month hover text color. |
| `--jb-calendar-month-button-border-radius` | Month button border radius. |
| `--jb-calendar-year-bgcolor-hover` | Year hover background color. |
| `--jb-calendar-year-color-hover` | Year hover text color. |
| `--jb-calendar-year-button-border-radius` | Year button border radius. |

```css
jb-calendar {
  --jb-calendar-day-bgcolor-selected: var(--jb-primary);
  --jb-calendar-day-color-selected: var(--jb-white);
  --jb-calendar-arrow-button-border-radius: 999px;
}
```

## Accessibility notes

- Navigator buttons have localized `title` attributes.
- Day, month, and year choices are rendered as clickable elements inside shadow DOM.
- The component is an inline calendar UI, not a form-associated input. Use `jb-date-input` when native form input behavior is required.

## Dependencies

`jb-calendar` uses [`date-fns`](https://github.com/date-fns/date-fns) and [`date-fns-jalali`](https://github.com/date-fns-jalali/date-fns-jalali) for Gregorian and Jalali date calculations.

## Related Docs

- See [`jb-calendar/react`](https://github.com/javadbat/jb-calendar/tree/main/react) if you want to use this component in React.
- See [All JB Design System Component List](https://javadbat.github.io/design-system/) for more components.
- Use [Contribution Guide](https://github.com/javadbat/design-system/blob/main/docs/contribution-guide.md) if you want to contribute to this component.

## AI agent notes

- Import `jb-calendar` once before using `<jb-calendar>`.
- Configure the component with properties and methods; it does not expose public HTML attributes.
- Use `inputType = 'JALALI'` or `inputType = 'GREGORIAN'` before setting/selecting values when the date system matters.
- Listen to `select` and read `event.target.value`; the event does not include selected date data in `event.detail`.
- Use `dateRestrictions.min` and `dateRestrictions.max` with JavaScript `Date` objects.
- Use `jb-date-input` instead of `jb-calendar` when a form-associated date input field is needed.
- This package includes [`custom-elements.json`](./custom-elements.json) and points to it with the package.json `customElements` field. The field is documented by the Custom Elements Manifest project in [Referencing manifests from npm packages](https://github.com/webcomponents/custom-elements-manifest#referencing-manifests-from-npm-packages).
- In `custom-elements.json`, `exports.kind: "js"` describes the JavaScript/TypeScript class export and `exports.kind: "custom-element-definition"` maps the `jb-calendar` tag name to that class.
