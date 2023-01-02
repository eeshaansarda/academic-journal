import { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import {PublicUser} from "@responses/user";
import PaginationButtons, { PageData } from '@components/pagination/PaginationButtons';
import {UserService} from "@services/user/userService";
import AdminUserDetails from "@pages/admin/tabs/users/AdminUserDetails";
import ProfileLink from "@components/profile/ProfileLink";
import UsersRolePill from "@components/user/role/UserRolePill";
import NoUsers from "@components/user/noUsers/NoUsers";

const MAX_USERS_PER_PAGE = 10;

export default function UsersTab() {
    const [ users, setUsers ] = useState<PublicUser[]>([]);
    const [ selectedUser, setSelectedUser ] = useState<PublicUser | null>(null);
    const [ pageData, setPageData ] = useState<PageData>({
        pageNumber: 1,
        numPages: 1
    });
    const userService = new UserService();

    /**
     * Loads the list of users.
     * @param pageNumber The page number.
     */
    function loadUsers(pageNumber: number) {
        userService.getUsers('', pageNumber, 1).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setUsers(response.data.users);
                setPageData({
                    pageNumber: pageNumber,
                    numPages: Math.ceil(response.data.numUsers / MAX_USERS_PER_PAGE)
                });

                // hide manage user page when we switch pages
                if (selectedUser) {
                    setSelectedUser(null);
                }
            }
        }).catch(_ => {});
    }

    /**
     * Returns a table row for a given user.
     * @param user The user.
     * @returns The table row.
     */
    function getUserRow(user: PublicUser): JSX.Element {
        return <tr
            key={user.id}
            onClick={() => setSelectedUser(user)}
            style={{ cursor: 'pointer', background: selectedUser === user ? 'rgba(3, 144, 252, 0.2)' : 'rgba(255, 255, 255, 0)'}}
        >
            <td><ProfileLink userId={user.id} username={user.username} /></td>
            <td><UsersRolePill role={user.role} /></td>
        </tr>
    }
    
    useEffect(() => {
        loadUsers(1);
    }, []);

    if (!users.length)
        return <NoUsers />

    return (
        <Container>
            <Row>
                <Col>
                    {selectedUser === null ? <Table striped>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Roles</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map(u => getUserRow(u))}
                        </tbody>
                    </Table>:
                    <AdminUserDetails userId={selectedUser.id} exit={() => setSelectedUser(null)} />}
                </Col>
            </Row>

            <Row hidden={selectedUser !== null}>
                <Col className="d-flex justify-content-center">
                    {pageData.numPages > 1
                        ? <PaginationButtons
                            pageData={pageData}
                            pageChanged={pageNumber => loadUsers(pageNumber)}/>
                        : <Container/>
                    }
                </Col>
            </Row>
        </Container>
    );
}