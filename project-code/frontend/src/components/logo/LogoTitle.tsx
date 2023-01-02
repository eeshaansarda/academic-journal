import {Col, Image, Row} from "react-bootstrap";
import StAndrewsLogo from "@assets/st-andrews-cs.png";
import {Container} from "react-bootstrap";

/**
 * @property title the title to display
 */
interface LogoTitleProps {
    title: string;
}

/**
 * Displays the StAndrews logo image along with a title
 * @param props the props to inject into the component
 */
export default function LogoTitle(props: LogoTitleProps) {
    return (
        <Container>
            <Row>
                <Col className="d-flex justify-content-center">
                    <Image rounded
                           height={150}
                           width={150}
                           src={StAndrewsLogo}
                           alt="St Andrews Computer Science Logo" />
                </Col>
            </Row>
            <Row>
                <Col className="text-center mt-2">
                    <h2 className="mb-3">{props.title}</h2>
                </Col>
            </Row>
        </Container>
    );
}