import { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import PaginationButtons, { PageData } from '@components/pagination/PaginationButtons';
import BanDetails from '@pages/admin/tabs/bans/BanDetails';
import {BanService} from "@services/ban/banService";
import {Ban} from "@responses/bans";
import ProfileLink from "@components/profile/ProfileLink";
import NoBans from "@components/ban/NoBans";

const MAX_BANS_PER_PAGE = 10;

export default function BansTab() {
    const [ bans, setBans ] = useState<Ban[]>([]);
    const [ selectedBan, setSelectedBan ] = useState<Ban | null>(null);
    const [ pageData, setPageData ] = useState<PageData>({
        pageNumber: 1,
        numPages: 1
    });
    const banService = new BanService();

    /**
     * Loads the list of bans.
     * @param pageNumber The page number.
     */
    function loadBans(pageNumber: number) {
        banService.getBans(pageNumber).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setBans(response.data.bans);
                setPageData({
                    pageNumber: pageNumber,
                    numPages: Math.ceil(response.data.numBans / MAX_BANS_PER_PAGE)
                });

                // hide selected ban details when we switch pages
                if (selectedBan) {
                    setSelectedBan(null);
                }
            }
        }).catch(_ => {});
    }

    /**
     * Returns a table row for a given ban.
     * @param ban metadata about the ban
     * @returns The table row.
     */
    function getBanRow(ban: Ban): JSX.Element {
        const expiry = new Date(ban.expiry).toUTCString();
        return <tr
            key={ban.id} 
            onClick={() => setSelectedBan(ban)}
            style={{ cursor: 'pointer' }}
        >
            <td><ProfileLink userId={ban.subject.id} username={ban.subject.username} /></td>
            <td>{expiry}</td>
        </tr>
    }

    /**
     * Removes the currently selected ban from the list (as it has been
     * revoked).
     */
    function removeBan(): void {
        if (selectedBan) {
            const index = bans.indexOf(selectedBan);
            if (index >= 0) {
                bans.splice(index, 1);
            }
        }
    }

    // componentDidMount
    useEffect(() => {
        loadBans(1);
    }, []);

    if (!bans.length)
        return <NoBans />;

    return (
        <Container>
            <Row>
                {!selectedBan ? <Col>
                    <Table striped>
                        <thead>
                        <tr>
                            <th>User</th>
                            <th>Expires</th>
                        </tr>
                        </thead>

                        <tbody>
                        {bans.map(b => getBanRow(b))}
                        </tbody>
                    </Table>
                </Col> :
                    <Col>
                        <BanDetails
                            key={selectedBan.id}
                            ban={selectedBan}
                            exit={() => setSelectedBan(null)}
                            banRevoked={removeBan}/>
                    </Col>
                }


            </Row>

            {pageData.numPages > 1
                ? <PaginationButtons 
                    pageData={pageData}
                    pageChanged={pageNumber => loadBans(pageNumber)}/>
                : <Container/>
            }
        </Container>
    );
}