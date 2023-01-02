import {Button} from "react-bootstrap";
import {PrivateDiscussionIcon} from "@components/icon/Icons";
import {PrivateDiscussionService} from "@services/privateDiscussion/privateDiscussionService";
import {useHistory} from "react-router-dom";
import {privateDiscussionPath} from "@config/paths";

/**
 * Component for creating a private discussion within the system
 */
export default function CreatePrivateDiscussion() {
    const privateDiscussionService = new PrivateDiscussionService();
    const history = useHistory();

    /**
     * Creates a private discussion and redirects the user to the 
     * page for the newly created discussion.
     */
    function createPrivateDiscussion() {
        privateDiscussionService.createPrivateDiscussion().then(res => {
            if (res.data && res.data.status === "success")
                history.push(privateDiscussionPath.replace(":privateDiscussionId", res.data.discussionId));
        });
    }

    return (
        <Button variant="primary" onClick={createPrivateDiscussion}>
            <PrivateDiscussionIcon /> Create Discussion
        </Button>
    );
}