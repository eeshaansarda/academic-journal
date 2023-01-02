import {ThemeIcon} from "@components/icon/Icons";
import * as theme from "@root/theme/themes.json";
import {Col, Container, Row} from "react-bootstrap";
import {useThemeSwitcher} from "react-css-theme-switcher";
import {Team15ThemeCard, ThemeCard} from "@components/theme/ThemeCard";
import ThemeService from "@services/theme/themeService";

export default function Theme() {
    const { switcher } = useThemeSwitcher();
    const themeService = new ThemeService();

    function switchTheme (theme: string) {
        themeService.setTheme(theme);
        switcher({ theme });
    }


    return (<Container>
        <h2><ThemeIcon /> Themes</h2>
        <hr />

        <Row>
            <Col className="d-flex justify-content-center flex-wrap">
                <Team15ThemeCard
                    description="Team 15's Theme"
                    name="t15"
                    onThemeSelected={switchTheme.bind(null, "t15")} />
                {theme.themes.filter(t => t.name !== "t15")
                    .map(t => <ThemeCard description={t.description}
                                         key={t.name}
                                         name={t.name}
                                         preview={t.thumbnail}
                                         onThemeSelected={switchTheme.bind(null, t.name)} />)}
            </Col>
        </Row>
    </Container>);
}