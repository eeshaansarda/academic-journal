import {Card} from "react-bootstrap";
import {SubmissionIcon} from "@components/icon/Icons";
import {truncate} from "lodash";
import {removeTags} from "@root/utilities/sanitize/sanitizeHtml";
import {Link} from "react-router-dom";
import {publicationPath} from "@config/paths";


const DESCRIPTION_LENGTH = 50;

/**
 * @property title the title of the publication
 * @property describe the description of the publication
 * @property publicationId the id of the publication
 */
export interface PublicationCardProps {
    title: string;
    description: string;
    publicationId: string;
}

/**
 * Component for representing a publication within the system. When click takes the user to the
 * publication page
 */
export default function PublicationCard(props: PublicationCardProps) {
    return (
        <Card style={{width: '12rem'}} className="m-3 p-4">
            <Card.Title>
                <h6><SubmissionIcon /></h6>
                <h5>{props.title}</h5>
            </Card.Title>

            <Card.Text>{truncate(removeTags(props.description), { length: DESCRIPTION_LENGTH })}</Card.Text>

            <Link to={`${publicationPath}/${props.publicationId}`} className="stretched-link">Read here</Link>
        </Card>
    );
}