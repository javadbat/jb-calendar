import type { ReactComponentBuildConfig, WebComponentBuildConfig } from "../../tasks/build/builder/src/types.ts";

export const webComponentList: WebComponentBuildConfig[] = [
  {
    name: "jb-calendar",
    path: "./lib/jb-calendar.ts",
    outputPath: "./dist/jb-calendar.js",
    external: ["date-fns", "date-fns-jalali"],
    umdName: "JBCalendar",
    //because date-fns dont have any umd module export i have to do this so it doenst exclude in umd build
    umdIncludes: ["date-fns", "date-fns-jalali"],
  },
];
export const reactComponentList: ReactComponentBuildConfig[] = [
  {
    name: "jb-calendar-react",
    path: "/web-component/jb-calendar/react/lib/JBCalendar.tsx",
    outputPath: "/web-component/jb-calendar/react/dist/JBCalendar.js",
    external: ["jb-calendar", "prop-types", "react"],
    globals: {
      react: "React",
      "prop-types": "PropTypes",
    },
    umdName: "JBCalendarReact",
    dir: "./react"
  },
];