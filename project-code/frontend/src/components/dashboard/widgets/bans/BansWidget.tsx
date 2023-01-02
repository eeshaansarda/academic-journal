import {BanService} from "@services/ban/banService";
import {useEffect, useState} from "react";
import {Ban} from "@responses/bans";
import InfiniteScroll from "react-infinite-scroller";
import {v4} from "uuid";
import {Table} from "react-bootstrap";

/**
 * @property ban the ban to display
 */
interface BansRowProps {
    ban: Ban;
}

/**
 * Represents a row within the list of bans
 *
 * @param ban the ban to display
 */
function BansRow({ ban }: BansRowProps) {
    return (
        <tr>
            <td>{ban.id}</td><td>{ban.subject}</td><td>{ban.issuer}</td><td>{ban.reason}</td>
        </tr>
    )
}

/**
 * The bans table header
 */
const BansHeader = () => <thead>
    <tr><th>ID</th><th>Subject</th><th>Issuer</th><th>Reason</th></tr>
</thead>;

/**
 * Widget for showing a list of bans in the system
 */
export default function BansWidget () {
    const [bans, setBans] = useState<Ban[]>([]);
    const [numBans, setNumBans] = useState(0);
    const [componentId] = useState(`bans-widget-${v4()}`);
    const banService = new BanService();

    function getBans(pageNumber: number) {
        banService.getBans(pageNumber).then(res => {
            if (res && res.data.status === "success") {
                setBans([...bans, ...res.data.bans]);
                setNumBans(res.data.numBans);
            }
        });
    }

    useEffect(() => {
        getBans(1);
    }, [])

    const rows = bans.map(ban => <BansRow key={ban.id} ban={ban} />)

    return (
        <div style={{overflowY: 'auto'}}>
            <InfiniteScroll
                pageStart={1}
                getScrollParent={() => document.getElementById(componentId)}
                loadMore={getBans}
                hasMore={numBans !== bans.length}
                style={{width: '100%'}}>
                <Table striped bordered hover style={{width: '100%'}}>
                    <BansHeader />
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </InfiniteScroll>
        </div>
    );
}