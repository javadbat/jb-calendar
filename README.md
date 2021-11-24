# jb-calendar

pure js jalali calendar interface web component
sample:  <https://codepen.io/javadbat/pen/poRKYEY>

 - support jalali date as well as gregorian date
 - customizable theme with css variable so you can implement dark mode too
## installation

```cmd
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

we use `dayjs` to manege calendar jalali data

### events

```js
//when defualt property are defined best time for impl your config like min and max date
document.querySelector('jb-calendar').addEventListener('init',this.onCalendarElementInitiated);

//when calendar init all property and function and dom created and bind successully
document.querySelector('jb-calendar').addEventListener('load',this.onCalendarElementLoaded);

//when user select a selectable day on calendar
document.querySelector('jb-calendar').addEventListener('select',this.onDaySelected);
```

### Jalali and Gregorian Date input

in jb-calendar you can set date input type to be jalali or gregorian and change it whenever you want by simple set `dateInput` to `JALALI` or `GREGORIAN`.

```js
    document.querySelector('jb-calendar').dateInput = `GREGORIAN`;
```

## attribute

### other attribute

| atribute name  | description                                                                                                         |
| -------------  | -------------                                                                                                       |
| direction      | set web-component direction for legacy browser dont support `:dir()`. defualt set is rtl but if you need ltr use `<jb-input direction="ltr"></jb-input>`      |

### set custome style

in some cases in your project you need to change defualt style of web-component for example you need different color or different border-radius and etc.    
if you want to set a custom style to this web-component all you need is to set css variable in parent scope of web-component

| css variable name                        | description                                                                                   |
| --jb-calendar-color                      | general text color of component                                                               |
| --jb-calendar-arrow-button-bgcolor       | background color of next and prev button                                                      |
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
