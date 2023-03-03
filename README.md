# jb-calendar

pure js jalali calendar interface web component
sample:  <https://codepen.io/javadbat/pen/poRKYEY>

 - support jalali date as well as gregorian date
 - customizable theme with css variable so you can implement dark mode too
 - support typescript
## installation

```bash
npm install jb-calendar
```

## usage

```html
    <jb-calendar></jb-calendar>
```

in frameworks for example React:

```jsx
import 'jb-calendar'
function myHOC(){
    return(
        <jb-calendar></jb-calendar>   
    )
}
```

### select value

```js
    document.querySelector('jb-calendar').select(year,month,day);
    // for example:
    document.querySelector('jb-calendar').select(1399,8,24);
```

you can write wrapper for it in any js framework you use and it will compatible with react, vue, angular, ...

## dependancy

we use `date-fns` and `date-fns-jalali` to manege calendar jalali data

## events

```js
//when defualt property are defined best time for impl your config like min and max date
document.querySelector('jb-calendar').addEventListener('init',this.onCalendarElementInitiated);

//when calendar init all property and function and dom created and bind successully
document.querySelector('jb-calendar').addEventListener('load',this.onCalendarElementLoaded);

//when user select a selectable day on calendar
document.querySelector('jb-calendar').addEventListener('select',this.onDaySelected);
```

## Jalali and Gregorian Date input

in jb-calendar you can set date input type to be jalali or gregorian and change it whenever you want by simple set `dateInput` to `JALALI` or `GREGORIAN`.

```js
    document.querySelector('jb-calendar').dateInput = `GREGORIAN`;
```
## set default selected day and month

you can say which date is shown by default in component when loaded like this: 

```javascript
document.querySelector('jb-calendar').defaultCalendarData = {
            gregorian:{
                year: 2022,
                month:1,
            },
            jalali:{
                year:1400,
                month:1,
            }
        };
```
if you not set this the default will be today year and month

## persian number

you can set `usePersianNumber` so calendar number format change to persian number char for example in year instead of `1400` you will see `۱۴۰۰`.

```javascript

document.querySelector('jb-calendar').usePersianNumber = true;

```
## attribute

### other attribute

| atribute name  | description                                                                                                         |
| -------------  | -------------                                                                                                       |
| direction      | make component placing order to rtl  `<jb-calendar direction="rtl"></jb-calendar>`      |

### set custome style

in some cases in your project you need to change defualt style of web-component for example you need different color or different border-radius and etc.    
if you want to set a custom style to this web-component all you need is to set css variable in parent scope of web-component

| css variable name                        | description                                                                                   |
| -------------                            | -------------                                                                                 |
| --jb-calendar-color                      | general text color of component                                                               |
| --jb-calendar-arrow-button-bgcolor       | background color of next and prev button                                                      |
| --jb-calendar-arrow-button-border-radius | border rauis of arrow buttons default is 12px                                                 | 
| --jb-calendar-day-text-color             | day text color                                                                                |
| --jb-calendar-day-text-color-disabled    | day text color when day in not available for select                                           |
| --jb-calendar-day-text-color-today       | today day text color                                                                          |
| --jb-calendar-day-bgcolor-selected       | selected day background color                                                                 |
| --jb-calendar-day-bgcolor-selected-hover | selected day background color on hover                                                        |
| --jb-calendar-day-bgcolor-hover          | day background color on hover                                                                 |
| --jb-calendar-status-point-bgcolor-today | backgrround color of small cirle under today text                                             |
| --jb-calendar-status-point-border-color  | border color of status point                                                                  |
| --jb-calendar-month-bgcolor-hover        | background color of month in month list in hover state                                        |
| --jb-calendar-year-bgcolor-hover         | background color of year in month list in hover state                                         |
| --jb-calendar-arrow-fill-color           | next and prev arrow icon color                                                                |
| --jb-calendar-day-color-hover            | day color hover default color is `#312d2d`                                                    |
| --jb-calendar-month-color-hover          | day color hover default color is `#312d2d`                                                    |
| --jb-calendar-year-color-hover           | day color hover default color is `#312d2d`                                                    |