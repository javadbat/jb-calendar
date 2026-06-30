import type { JBCalendarWebComponent } from 'jb-calendar';

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      'jb-calendar': JBCalendarType;
    }
    interface JBCalendarType extends React.DetailedHTMLProps<React.HTMLAttributes<JBCalendarWebComponent>, JBCalendarWebComponent> {
      "type"?: string,
      "label"?:string,
      "message"?:string,
      "placeholder"?:string,
    }
  }
}
