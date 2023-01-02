import {Button, Card} from "react-bootstrap";
import Team15Preview from "./team_15_theme.png";

/**
 * Component for representing a theme to select
 * @property description description of the theme we are adding
 * @property name name of the theme to select
 * @property onThemeSelected fired when we select the theme
 */
interface ThemeCard {
    description: string;
    name: string;
    preview: string;
    onThemeSelected: () => void;
}

/**
 * @property description the description of the team 15 theme
 * @property name the name of the team 15 theme
 * @property onThemeSelected event fired when the team 15 theme is selected
 */
interface Team15ThemeCardProps {
    description: string;
    name: string;
    onThemeSelected: () => void;
}

/**
 * Represents the team 15 theme. When clicked changes the style to the team 15 style.
 * Requires separate file as we need to display the team15 preview image.
 *
 * @param props
 */
export function Team15ThemeCard(props: Team15ThemeCardProps) {
    return (
        <Card className="m-2">
            <Card.Img variant="top" style={{maxWidth: 400, maxHeight: 300}} src={Team15Preview} />
            <Card.Body>
                <Card.Title>{props.name}</Card.Title>
                <Card.Text>{props.description}</Card.Text>
            </Card.Body>
            <Button variant="primary" onClick={props.onThemeSelected}>Select</Button>
        </Card>);
}

/**
 * Card that represent a bootswatch theme. Upon selecting the theme changes the theme of the submission
 * @param props
 * @constructor
 */
export function ThemeCard(props: ThemeCard) {
    return (
        <Card className="m-2">
            <Card.Img variant="top" style={{maxWidth: 400, maxHeight: 300}} src={props.preview} />
            <Card.Body>
                <Card.Title>{props.name}</Card.Title>
                <Card.Text>{props.description}</Card.Text>
            </Card.Body>
            <Button variant="primary" onClick={props.onThemeSelected}>Select</Button>
        </Card>
    )
}
