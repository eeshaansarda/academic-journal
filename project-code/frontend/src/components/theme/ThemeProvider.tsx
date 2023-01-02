import React, {useEffect} from "react";
import {ThemeSwitcherProvider, useThemeSwitcher} from "react-css-theme-switcher";
import * as themes from "../../theme/themes.json";
import ThemeService from "@services/theme/themeService";

interface ThemeProviderProps {
    children: React.ReactNode;
}

const themeMap = Object.fromEntries(themes.themes.map(theme => [theme.name, theme.cssMin]));

/**
 * Gets and sets the users default theme
 */
export function DefaultTheme() {
    const themeService = new ThemeService();
    const { switcher } = useThemeSwitcher();

    useEffect(() => {
        themeService.getTheme().then(res => {
            if (res.data && res.data.status === "success") {
                if (themeMap[res.data.theme] !== undefined) {
                    switcher ({ theme: res.data.theme });
                }
            }
        }).catch(_ => {});
    }, []);

    return null;
}

/**
 * Provides the theme context to all of its child nodes
 * @param children
 * @constructor
 */
export default function ThemeProvider ({ children }: ThemeProviderProps) {
    return (<ThemeSwitcherProvider defaultTheme={localStorage.getItem("theme") ?? "t15"} themeMap={themeMap}>
        {children}
    </ThemeSwitcherProvider>)
}