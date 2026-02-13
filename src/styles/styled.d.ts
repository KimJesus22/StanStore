import 'styled-components';
import { ThemeType } from './themes';

declare module 'styled-components' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface DefaultTheme extends ThemeType { }
}
