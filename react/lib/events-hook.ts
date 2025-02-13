import { useEvent } from "jb-core/react";
import { RefObject } from "react";
import type {JBCalendarEventType, JBCalendarWebComponent} from 'jb-calendar';

export type EventProps = {
    onSelect?: (e: JBCalendarEventType<CustomEvent>) => void,
}
export function useEvents(element:RefObject<JBCalendarWebComponent>,props:EventProps){
  useEvent(element, 'select', props.onSelect);
}