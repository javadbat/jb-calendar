type FileStringModule = {
    readonly default: string;
}
declare module '*.scss' {
    const value: FileStringModule;
    export default value;
}
declare module '*.html' {
    const value: FileStringModule;
    export default value.default
}
declare namespace dayjs {
   let  OptionType :{jalali?:boolean, locale?: string, format?: string, utc?: boolean } | string | string[]
}