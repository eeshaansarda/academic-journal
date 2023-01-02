import {Container, Row, Col, Nav, Tab} from 'react-bootstrap';
import BansTab from '@pages/admin/tabs/bans/BansTab';
import ReportsTab from '@pages/admin/tabs/reports/ReportsTab';
import UsersTab from '@pages/admin/tabs/users/UsersTab';
import {AdminIcon} from "@components/icon/Icons";

enum AdminTabs {
    Users,
    Reports,
    Bans
}

export default function Admin() {
    return (
        <Container fluid>
           <h2 className="mb-4"> <AdminIcon />  Admin</h2>
            <Tab.Container defaultActiveKey={AdminTabs.Users}>
                <Row>
                    <Col xs={2} style={{cursor: 'pointer'}}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Link eventKey={AdminTabs.Users}>Users</Nav.Link>
                        </Nav>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Link eventKey={AdminTabs.Reports}>Reports</Nav.Link>
                        </Nav>

                        <Nav variant="pills" className="flex-column">
                            <Nav.Link eventKey={AdminTabs.Bans}>Bans</Nav.Link>
                        </Nav>
                    </Col>
                    <Col>
                        <Tab.Content>
                            <Tab.Pane eventKey={AdminTabs.Users}>
                                <UsersTab />
                            </Tab.Pane>
                            <Tab.Pane eventKey={AdminTabs.Reports}>
                                <ReportsTab />
                            </Tab.Pane>
                            <Tab.Pane eventKey={AdminTabs.Bans}>
                                <BansTab />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>

        </Container>
    );
}