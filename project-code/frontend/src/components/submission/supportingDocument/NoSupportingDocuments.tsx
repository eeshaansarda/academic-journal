import {ErrorIcon} from "@components/icon/Icons";
import {Container} from "react-bootstrap";

export default function NoSupportingDocuments() {
    return (<Container className="text-muted text-center">
        <h2><ErrorIcon /></h2>
        <h2>No Supporting Documents Found</h2>
    </Container>);
}