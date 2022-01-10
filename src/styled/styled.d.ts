// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
        white: string,
        greenText: string,
        greenBg: string,
        redText: string,
        redBg: string,
    },
    breakpoints?: any
  }
}