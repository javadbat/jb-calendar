import type { JBCalendarWebComponent } from "jb-calendar";
import { type RefObject, useEffect } from "react";

export type JBCalendarAttributes = {
  min?:Date,
  max?:Date,
  jalaliMonthList?: string[],
}
export function useJBCalendarAttribute(element: RefObject<JBCalendarWebComponent>, props: JBCalendarAttributes) {
  useEffect(()=>{
    if(props.jalaliMonthList){
      element.current.setMonthList('JALALI',props.jalaliMonthList);
    }
  },[props.jalaliMonthList, element]);

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
}