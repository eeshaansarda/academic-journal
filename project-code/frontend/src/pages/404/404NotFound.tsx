import {Container} from "react-bootstrap";
import {NotFoundIcon} from "@components/icon/Icons";

export default function NotFound404() {
    return (
        <Container className="text-center">
            <h2><NotFoundIcon /></h2>
            <h2>Resource could not be found</h2>
        </Container>);
}
