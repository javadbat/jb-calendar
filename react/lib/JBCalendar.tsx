'use client';
import React, { useRef, useEffect, useState, useImperativeHandle } from 'react';
import 'jb-calendar';
// eslint-disable-next-line no-duplicate-imports
import { JBCalendarWebComponent, InputType, Direction } from 'jb-calendar';
import { EventProps, useEvents } from './events-hook.js';
declare module "react" {
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
const JBCalendar = React.forwardRef((props:Props, ref) => {
  
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
    element.current.direction = props.direction;
  },[props.direction]);

  useEffect(()=>{
    if(props.jalaliMonthList){
      element.current.setMonthList('JALALI',props.jalaliMonthList);
    }
  },[props.jalaliMonthList]);

  useEffect(()=>{
    if(element.current){
      element.current.dateRestrictions.min = props.min;
    }
  },[element.current, props.min]);

  useEffect(()=>{
    if(element.current){
      element.current.dateRestrictions.max = props.max;
    }
  },[element.current, props.max]);

  useEvents(element, props);
  
  return (
    <jb-calendar ref={element} class={props.className} style={props.style}></jb-calendar>
  );

});

export type Props = EventProps & {
  value?: string,
  jalaliMonthList?: string[],
  inputType?: InputType,
  direction?:Direction,
  className?:string,
  style?:React.CSSProperties
  min?:Date,
  max?:Date,
};
export {JBCalendar};
