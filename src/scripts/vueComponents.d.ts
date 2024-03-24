declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    const componentOptions: ComponentOptions
    export default componentOptions
}

declare module '*.svg' {
    const filePath: string;
    export default filePath;
}
declare module '*.png' {
    const filePath: string;
    export default filePath;
}
declare module '*.jpg' {
    const filePath: string;
    export default filePath;
}