import {Container, Row, Col} from "react-bootstrap";
import SubmissionsOfTheDay from "@components/published/featuredSubmissions/SubmissionOfTheDay";
import TrendingSubmissions from "@components/published/featuredSubmissions/TrendingSubmissions";
import SearchPublications from "@components/published/featuredSubmissions/SearchPublications";

export default function FeaturedSubmissions() {

    return (
        <div>
            <Container className="p-1">
                <Row className="mb-2">
                    <Col>
                        <h3>Featured Publications</h3>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <SearchPublications />
                </Row>
                <Row>
                    <Col>
                        <SubmissionsOfTheDay />
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <TrendingSubmissions />
                    </Col>
                </Row>
            </Container>
        </div>
    );
}