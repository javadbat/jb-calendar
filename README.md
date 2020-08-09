# jb-calendar

pure js jalali calendar interface web component

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