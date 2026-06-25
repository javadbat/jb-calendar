import { useEvent } from "jb-core/react";
import type { RefObject } from "react";
import type {JBCalendarEventType, JBCalendarWebComponent} from 'jb-calendar';

export type EventProps = {
    onSelect?: (e: JBCalendarEventType<CustomEvent>) => void,
}
export function useEvents(element:RefObject<JBCalendarWebComponent | null>,props:EventProps){
  useEvent(element, 'select', props.onSelect);
}