# jb-calendar

pure js jalali calendar interface web component
sample:  <https://codepen.io/javadbat/pen/poRKYEY>

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
