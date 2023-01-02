import {AsyncTypeahead, Token} from "react-bootstrap-typeahead";
import {useState} from "react";
import {Option, SelectEvent} from "react-bootstrap-typeahead/types/types";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "@components/userSelector/userselector.css";
import {IUserIdentity} from "@responses/user";
import {UserService} from "@services/user/userService";
import ProfileLink from "@components/profile/ProfileLink";
import {Col, Row} from "react-bootstrap";

/**
 * @property selected the selected users
 * @property onChange fired when we change the list of users selected
 * @property disabled whether or not the component is disabled
 * @property isOptionDisabled whether or not the given option should be disabled
 */
interface UserSelectorProps {
    selected: IUserIdentity[];
    onChange: (users: Option[]) => void;
    disabled?: boolean;
    isOptionDisabled?: (option: Option) => boolean;
}

/**
 * Component for selecting (adding and removing) to some form of object (private discussion, submission etc)
 *
 * @param selected
 * @param onChange
 * @param disabled
 * @param isOptionDisabled
 * @constructor
 */
export function UserSelector({ selected, onChange, disabled, isOptionDisabled } : UserSelectorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<IUserIdentity[]>([]);
    const [numUsers, setNumUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const PER_PAGE = 10;

    const filterBy = () => true;
    const userService = new UserService();

    function search(username: string) {
        setIsLoading(true);
        userService.getUsers(username, 1, 1).then(res => {
            if (res.data && res.data.status === "success") {
                setUsers(res.data.users);
                setCurrentPage(1);
                setNumUsers(res.data.numUsers);
            }
            setIsLoading(false);
        });
    }

    /**
     * When the pagination button is selected increment the page and get more results
     * @param e
     * @param shownResults the number of results to show
     */
    function handlePagination(e: SelectEvent<HTMLElement>, shownResults: number) {
        if (shownResults > numUsers)
            return;


        setIsLoading(true);
        userService.getUsers((e.currentTarget as any), currentPage + 1, 1).then(res => {
            if (res.data && res.data.status === "success") {
                setNumUsers(res.data.numUsers);
                setUsers([...users, ...res.data.users]);
                setCurrentPage(currentPage + 1);
            }
            setIsLoading(false);
        })
    }

    return (
        <AsyncTypeahead
            filterBy={filterBy}
            isLoading={isLoading}
            minLength={3}
            labelKey="username"
            multiple
            onSearch={search}
            options={users}
            id="user-selector"
            placeholder="Search for a user..."
            selected={selected}
            paginate
            maxResults={PER_PAGE - 1}
            onPaginate={handlePagination}
            onChange={onChange}
            disabled={!!disabled}
            useCache={false}
            renderMenuItemChildren={option => {
                const user = option as (Option & IUserIdentity);
                // Each menu item consists of a users profile nad username
                return (<Row key={user.id}>
                    <Col xs="auto">
                        <ProfileLink userId={user.id} height={20} width={20} />
                    </Col>
                    <Col>
                        <span>{user.username}</span>
                    </Col>
                </Row>)
            }}
            renderToken={(option, props, index) => {
                const optionUser = option as (Option & IUserIdentity);

                return (
                    <Token
                        option={option}
                        onRemove={props.onRemove}
                        disabled={disabled ? true : isOptionDisabled ? isOptionDisabled(option) : false}
                    >
                        <span>{optionUser.username}</span>
                    </Token>
                )
            }}
            />
    );
}