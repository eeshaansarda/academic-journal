import {Offcanvas} from "react-bootstrap";
import {UserSelector} from "@components/userSelector/UserSelector";
import {useEffect, useState} from "react";
import {IUserIdentity} from "@responses/user";
import {PrivateDiscussionService} from "@services/privateDiscussion/privateDiscussionService";
import {Option} from "react-bootstrap-typeahead/types/types";
import {Form} from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectUser } from "@slices/userSlice";
import { PrivateDiscussion } from "@responses/privateDiscussion";

/**
 * Represents the properties passed to the metadata component.
 * @property show whether or not to show the metadata component
 * @property onHide triggered when we hide the private discussion
 * @property discussionId the id of the private discussion.
 */
interface PrivateDiscussionMetadataProps {
    show: boolean;
    onHide: () => void;
    discussionId: string;
}

/**
 * The private discussion metadata component. Displays the list of users
 * within the discussion.
 * @param props The properties.
 * @returns The component.
 */
export default function PrivateDiscussionMetadata(props: PrivateDiscussionMetadataProps) {
    const user = useSelector(selectUser);
    const [discussion, setDiscussion] = useState<PrivateDiscussion | null>(null);
    const [selected, setSelected] = useState<IUserIdentity[]>([]);
    const privateDiscussionService = new PrivateDiscussionService();

    /**
     * Loads the list of users within the discussion.
     */
    function getUsers() {
        privateDiscussionService.getPrivateDiscussion(props.discussionId).then(res => {
            if (res.data && res.data.status === "success") {
                setDiscussion(res.data.discussion);
                setSelected(res.data.discussion.users);
            }
        });
    }

    /**
     * Updates the users within the discussion.
     * @param options The elements that are selected in the select
     * users dropdown menu.
     */
    function setSelectedUsers (options: Option[]) {
        const users = options as (IUserIdentity & Option)[];

        privateDiscussionService.setUsers(props.discussionId, users.map(user => user.id)).then(res => {
            if (res.data && res.data.status === "success")
                getUsers();
        });
    }

    /**
     * Loads the list of users on component load.
     */
    useEffect(() => {
        getUsers();
    }, [props.discussionId]);

    const canEditMetadata = user && discussion ? user.id === discussion.host.id : false;

    return (<Offcanvas placement="end" show={props.show} onHide={props.onHide}>
        <Offcanvas.Header closeButton />
        <Offcanvas.Body>
            <UserSelector 
                selected={selected} 
                onChange={setSelectedUsers}
                disabled={!canEditMetadata}
                isOptionDisabled={(option: any) => {
                    const isCurrentUser = user ? option.id == user.id : false;
                    const isHost = discussion ? option.id == discussion.host.id : false;
                    return isCurrentUser || isHost;
                }} />
            <Form.Text muted>
                {canEditMetadata ? 'Add users to the private discussion.' : 'Only the host can add users to the private discussion'}
            </Form.Text>
        </Offcanvas.Body>
    </Offcanvas>);
}
