'use client';
import React, { useRef, useImperativeHandle } from 'react';
import 'jb-calendar';
import type { JBCalendarWebComponent, InputType, Direction } from 'jb-calendar';
import { type EventProps, useEvents } from './events-hook.js';
import { useJBCalendarAttribute, type JBCalendarAttributes } from './attribute-hook.js';
import type { JBElementStandardProps } from 'jb-core/react';
import './module-declaration.js';
// eslint-disable-next-line react/display-name
const JBCalendar = React.forwardRef((props:Props, ref) => {
  
  const element = useRef<JBCalendarWebComponent>(null);

  useImperativeHandle(
    ref,
    () => element.current??null,
    [element],
  );

  const {jalaliMonthList,max,min, onSelect, ...otherProps} = props;
  useJBCalendarAttribute(element,{jalaliMonthList,max,min})
  useEvents(element, {onSelect});
  
  return (
    <jb-calendar ref={element} {...otherProps}></jb-calendar>
  );

});

export type Props = EventProps & JBCalendarAttributes & JBElementStandardProps<JBCalendarWebComponent,keyof EventProps | keyof JBCalendarAttributes> & {
  value?: string,
  inputType?: InputType,
  direction?:Direction,
};
export {JBCalendar};
