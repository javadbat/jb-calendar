import type { ReactComponentBuildConfig, WebComponentBuildConfig } from "../../tasks/build/builder/src/types.ts";

export const webComponentList: WebComponentBuildConfig[] = [
  {
    name: "jb-calendar",
    path: "./lib/jb-calendar.ts",
    outputPath: "./dist/jb-calendar.js",
    external: ["date-fns", "date-fns-jalali", "jb-core"],
    umdName: "JBCalendar",
    //because date-fns dont have any umd module export i have to do this so it doenst exclude in umd build
    umdIncludes: ["date-fns", "date-fns-jalali"],
  },
];
export const reactComponentList: ReactComponentBuildConfig[] = [
  {
    name: "jb-calendar-react",
    path: "./react/lib/JBCalendar.tsx",
    outputPath: "./react/dist/JBCalendar.js",
    external: ["jb-calendar", "prop-types", "react", "jb-core", "jb-core/react"],
    globals: {
      react: "React",
      "prop-types": "PropTypes",
      "jb-core/react":"JBCoreReact"
    },
    umdName: "JBCalendarReact",
    dir: "./react"
  },
];