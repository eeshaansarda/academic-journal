import {useEffect, useState} from "react";
import {v4} from "uuid";
import InfiniteScroll from "react-infinite-scroller";
import {ReportService} from "@services/report/reportService";
import {Report} from "@responses/report";
import {Table} from "react-bootstrap";

/**
 * @property report the report to display
 */
interface ReportWidgetRowProps {
    report: Report;
}

/**
 * Represents a row within the widget
 * @param props the arguments injected into the component
 */
function ReportWidgetRow(props: ReportWidgetRowProps) {
    return (
        <tr>
            <td>{props.report.id}</td>
            <td>{props.report.subject.username}</td>
            <td>{props.report.reporter.username}</td>
        </tr>
    );
}

/**
 * The header of the table to display
 */
const ReportWidgetHeader = () => <thead><tr><th>Report ID</th><th>Subject</th><th>Submitted By</th></tr></thead>;

/**
 * Widget for displaying the different reports in the system
 *
 * @constructor
 */
export default function ReportsWidget() {
    const [componentId] = useState(`reports-widget-${v4()}`);
    const [reports, setReports] = useState<Report[]>([]);
    const [numReports, setNumReports] = useState<number>(0);

    const reportService = new ReportService();

    function getReports(pageNumber: number) {
        reportService.getReports(pageNumber).then(res => {
            if (res.data && res.data.status === "success") {
                setReports([...reports, ...res.data.reports]);
                setNumReports(res.data.numReports);
            }
        });
    }

    useEffect(() => {
        getReports(1);
    }, []);

    const rows = reports.map(report => <ReportWidgetRow report={report} />)

    return (
        <div style={{overflowY: 'auto'}}>
            <InfiniteScroll
                pageStart={1}
                getScrollParent={() => document.getElementById(componentId)}
                loadMore={getReports}
                hasMore={numReports !== reports.length}>
                <Table striped bordered hover style={{width: '100%'}}>
                    <ReportWidgetHeader />
                    <tbody>
                        {rows}
                    </tbody>
                </Table>
            </InfiniteScroll>
        </div>
    );
}