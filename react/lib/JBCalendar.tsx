import React, { useRef, useEffect, useState, useImperativeHandle } from 'react';
import 'jb-calendar';
// eslint-disable-next-line no-duplicate-imports
import { JBCalendarWebComponent, InputType } from 'jb-calendar';
import { useBindEvent } from '../../../../common/hooks/use-event.js';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'jb-calendar': JBCalendarType;
    }
    interface JBCalendarType extends React.DetailedHTMLProps<React.HTMLAttributes<JBCalendarWebComponent>, JBCalendarWebComponent> {
      "class"?: string,
      "type"?: string,
      "label"?:string,
      "message"?:string,
      "placeholder"?:string,
    }
  }
}
// eslint-disable-next-line react/display-name
const JBCalendar = React.forwardRef((props:any, ref) => {
  const element = useRef<JBCalendarWebComponent>(null);
  const [refChangeCount, refChangeCountSetter] = useState(0);
  useImperativeHandle(
    ref,
    () => (element ? element.current : {}),
    [element],
  );
  useEffect(() => {
    refChangeCountSetter(refChangeCount + 1);
  }, [element.current]);
  useEffect(() => {
    if (props.inputType) {
      element.current.inputType = props.inputType;
    }
  }, [props.inputType]);
  useEffect(()=>{
    element.current.setAttribute('direction', props.direction);
  },[props.direction]);
  useEffect(()=>{
    if(props.jalaliMonthList){
      element.current.setMonthList('JALALI',props.jalaliMonthList);
    }
  },[props.jalaliMonthList]);
  function onSelect(e:CustomEvent) {
    if (props.onSelect && e instanceof CustomEvent) {
      props.onSelect(e);
    }
  }
  useBindEvent(element, 'select', onSelect);
  return (
    <jb-calendar ref={element}></jb-calendar>
  );
});
export type Props = {
  onSelect: (e:CustomEvent)=>void,
  value: string,
  jalaliMonthList: string[],
  inputType: InputType
};
export {JBCalendar};
