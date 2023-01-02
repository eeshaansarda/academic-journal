import { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import PaginationButtons, { PageData } from '@components/pagination/PaginationButtons';
import { Container, Row, Col} from 'react-bootstrap';
import {UserService} from "@services/user/userService";
import {PublicUser} from "@responses/user";
import UserCard from "@components/user/UserCard";
import SearchComponent, {SortFilter} from "@components/search/SearchComponent";
import {UserIcon} from "@components/icon/Icons";
import NoUsers from "@components/user/noUsers/NoUsers";

const MAX_USERS_PER_PAGE = 10;

enum UserFilters {
    ALPHABETICAL_ORDER = 1,
    REVERSE_ALPHABETICAL_ORDER = -1
}

function UserList() {
    const [users, setUsers] = useState<PublicUser[]>([]);
    const [pageData, setPageData] = useState<PageData>({ pageNumber: 1, numPages: 1 });
    const [sort, setSort] = useState<number>(1);
    const [username, setUsername] = useState<string>('');
    const userService = new UserService();

    const filters: SortFilter[] = [{ eventKey: UserFilters.ALPHABETICAL_ORDER.toLocaleString(), title: 'Alphabetical Order' },
        { eventKey: UserFilters.REVERSE_ALPHABETICAL_ORDER.toLocaleString(), title: 'Reverse Alphabetical Order' }];

    function loadUsers(pageNumber: number) {
            userService.getUsers(username, pageNumber, sort).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setUsers(response.data.users);
                setPageData({ pageNumber, numPages: Math.ceil(response.data.numUsers / MAX_USERS_PER_PAGE)})
            }
        });
    }

    useEffect(() => {
        loadUsers(1);
    }, [username, sort]); // actually not needed as the PaginationButtons components uses the function  to change data

    return (
        <Container>
            <h2><UserIcon /> Users</h2><hr/>

            <Row>
                <Col>
                    <SearchComponent filters={filters} placeholder='Search for a user' onFilterChanged={e => setSort(parseInt(e))}
                                     onSearchChange={setUsername} />
                    <hr />
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className="d-flex flex-wrap justify-content-center">
                        {users.length ? users.map(user =>
                            <UserCard key={user.id} user={user}  />
                        ) :
                        <NoUsers />}
                    </div>
                </Col>
            </Row>

            <Col className="d-flex justify-content-center">
                <PaginationButtons
                    pageData={pageData}
                    pageChanged={pageNumber => loadUsers(pageNumber)}/>
            </Col>
        </Container>
    );
}

export default withRouter(UserList);
