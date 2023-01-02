import {Card, Dropdown} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {CSSProperties} from "react";


interface CardWithOptionsProps {
    // The set of possible options in the hamburger dropdown
    options: string[];
    onSelected: (option: string | null) => void;
    // Title of the card
    title: string;
    // Any style to apply to the card
    children?: JSX.Element | JSX.Element[] | null;
    style?: CSSProperties | undefined;
}

/**
 * Represents a bootstrap card component with a hamburger symbol as options.
 * Each option can be selected for a corresponding event to take place.
 *
 * @param props the parameters to pass to the component
 */
export default function CardWithOptions(props: CardWithOptionsProps) {
    return (
        <Card style={props.style}>
            <Card.Header>
                <span style={{fontSize: '1.5rem'}}>{props.title}</span>

                <Dropdown style={{float: 'right'}} onSelect={(value) => props.onSelected(value)}>
                    <Dropdown.Toggle variant="link">
                         <span>
                             <FontAwesomeIcon icon={faBars} />
                         </span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {props.options.map(option => <Dropdown.Item eventKey={option} key={option}>
                            {option}
                        </Dropdown.Item>)}
                    </Dropdown.Menu>
                </Dropdown>

            </Card.Header>
            {props.children}
        </Card>
    )
}