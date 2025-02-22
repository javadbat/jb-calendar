import type { ReactComponentBuildConfig, WebComponentBuildConfig } from "../../tasks/build/builder/src/types.ts";

export const webComponentList: WebComponentBuildConfig[] = [
  {
    name: "jb-calendar",
    path: "./lib/jb-calendar.ts",
    outputPath: "./dist/jb-calendar.js",
    external: ["date-fns", "date-fns-jalali", "jb-core"],
    umdName: "JBCalendar",
    //because date-fns dont have any umd module export i have to do this so it doesn't exclude in umd build
    umdIncludes: ["date-fns", "date-fns-jalali"],
  },
];
export const reactComponentList: ReactComponentBuildConfig[] = [
  {
    name: "jb-calendar-react",
    path: "./react/lib/JBCalendar.tsx",
    outputPath: "./react/dist/JBCalendar.js",
    external: ["jb-calendar", "react", "jb-core", "jb-core/react"],
    globals: {
      react: "React",
      "jb-calendar": "JBCalendar",
      "jb-core":"JBCore",
      "jb-core/react":"JBCoreReact"
    },
    umdName: "JBCalendarReact",
    dir: "./react"
  },
];