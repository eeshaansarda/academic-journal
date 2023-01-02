import {IUserIdentity} from "@responses/user";
import {Card, Col, Row} from "react-bootstrap";
import ProfileLink from "@components/profile/ProfileLink";
import {truncate} from "lodash";
import {Link} from "react-router-dom";
import {privateDiscussionPath} from "@config/paths";

/**
 * Represents the properties passed to a private discussion card
 * component.
 */
export interface PrivateDiscussionsCardProps {
    id: string;
    host: IUserIdentity;
    users: IUserIdentity[];
}

/**
 * Component for a single private discussion in the list of all private
 * discussions for a user.
 * @param props The properties.
 * @returns The component.
 */
export default function PrivateDiscussionsCard(props: PrivateDiscussionsCardProps) {
    const usernameTitle = props.users.map(user => user.username).join(", ");
    const MAX_USERNAME_LENGTH = 100;

    return (<Card className="mt-2">
        <Card.Body>
            <Row>
                <Col>
                      <Card.Title>
                        <div className="d-flex flex-wrap">
                            {props.users.map(user => <ProfileLink userId={user.id} />)}
                        </div>
                    </Card.Title>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Link className="stretched-link" to={privateDiscussionPath.replace(":privateDiscussionId", props.id)}>
                        {truncate(usernameTitle, { length: MAX_USERNAME_LENGTH })}
                    </Link>
                </Col>
            </Row>
        </Card.Body>
    </Card>);
}