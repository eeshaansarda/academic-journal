import { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import PaginationButtons, { PageData } from '@components/pagination/PaginationButtons';
import ReportDetails from '@pages/admin/tabs/reports/ReportDetails';
import {ReportService} from "@services/report/reportService";
import {Report} from "@responses/report";
import ProfileLink from "@components/profile/ProfileLink";
import NoReports from "@components/report/NoReports";

const MAX_REPORTS_PER_PAGE = 10;

export default function ReportsTab() {
    const [ reports, setReports ] = useState<Report[]>([]);
    const [ selectedReport, setSelectedReport ] = useState<Report | null>(null);
    const [ pageData, setPageData ] = useState<PageData>({
        pageNumber: 1,
        numPages: 1
    });

    const reportService = new ReportService();

    /**
     * Loads the list of reports.
     * @param pageNumber The page number.
     */
    function loadReports(pageNumber: number) {
        reportService.getReports(pageNumber).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setReports(response.data.reports);
                setPageData({
                    pageNumber: pageNumber,
                    numPages: Math.ceil(response.data.numReports / MAX_REPORTS_PER_PAGE)
                });

                // hide selected report details when we switch pages
                if (selectedReport) {
                    setSelectedReport(null);
                }
            }
        }).catch(_ => {});
    }

    function removeReport(): void {
        if (selectedReport) {
            const index = reports.indexOf(selectedReport);
            if (index >= 0) {
                reports.splice(index, 1);
            }
        }
    }

    /**
     * Returns a table row for a given report.
     * @param report metadata about the report.
     * @returns The table row.
     */
    function getReportRow(report: Report): JSX.Element {
        return <tr
            key={report.id} 
            onClick={() => setSelectedReport(report)}
            style={{ cursor: 'pointer', background: selectedReport === report ? 'rgba(3, 144, 252, 0.2)' : 'rgba(255, 255, 255, 0)'}}
        >
            <td>{report.id}</td>
            <td><ProfileLink userId={report.subject.id} username={report.subject.username} /></td>
            <td><ProfileLink userId={report.reporter.id} username={report.reporter.username} /></td>
        </tr>
    }

    // componentDidMount
    useEffect(() => {
        loadReports(1);
    }, []);

    if (!reports.length)
        return <NoReports />;

    return (
        <Container>
            <Row>
                { !selectedReport ?
                    <Col>
                        <Table striped>
                            <thead>
                            <tr>
                                <th>Report ID</th>
                                <th>Subject</th>
                                <th>Submitted by</th>
                            </tr>
                            </thead>

                            <tbody>
                            {reports.map(r => getReportRow(r))}
                            </tbody>
                        </Table>
                    </Col> :
                    <Col >
                        <ReportDetails
                            key={selectedReport.id}
                            report={selectedReport}
                            exit={() => setSelectedReport(null)}
                            reportResolved={removeReport}/>
                    </Col>
                }
            </Row>

            {pageData.numPages > 1
                ? <PaginationButtons 
                    pageData={pageData}
                    pageChanged={pageNumber => loadReports(pageNumber)}/>
                : <Container/>
            }
        </Container>
    );
}