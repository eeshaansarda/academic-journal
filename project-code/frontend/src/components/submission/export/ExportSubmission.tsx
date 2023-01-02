import {SuperGroupService} from "@services/superGroup/superGroupService";
import {useEffect, useState} from "react";
import {GROUP_NAME} from "@config/constants";
import {Button, Col, Form, OverlayTrigger, Popover, Row, Tooltip} from "react-bootstrap";

/**
 * @property submissionId the id of the submission we are exporting
 */
interface ExportSubmissionProps {
    submissionId: string;
}

enum ExportStatus {
    NONE,
    FAILURE,
    SUCCESS
}

const EXPORT_PLACEHOLDER = 'Export';

/**
 * Component used for exporting a submission from the site
 * @param props
 */
export default function ExportSubmission(props: ExportSubmissionProps) {
    const superGroupService = new SuperGroupService();
    const [exportStatus, setExportStatus] = useState(ExportStatus.NONE);
    const [ journalUrlMap, setJournalUrlMap ] = useState<{[key: string]: string}>({});
    const [ selectedJournal, setSelectedJournal ] = useState('');

    /**
     * Returns the export text element.
     * @returns Export text element.
     */
    function getExportText(): JSX.Element {
        switch (exportStatus) {
            case ExportStatus.NONE:
                return <p/>

            case ExportStatus.FAILURE:
                return <p className="text-danger mt-2">Failed to export</p>

            case ExportStatus.SUCCESS:
                return <p className="text-success mt-2">Successfully exported</p>
        }
    }

    /**
     *
     * Exports a submission to another journal.
     */
    function exportSubmission(): void {
        const url = journalUrlMap[selectedJournal] as string;

        superGroupService.exportSubmission(url, props.submissionId).then(response => {
            if (response.data.status && response.data.status === 'success') {
                setExportStatus(ExportStatus.SUCCESS);
            } else {
                setExportStatus(ExportStatus.FAILURE);
            }
        }).catch(_ => {
            setExportStatus(ExportStatus.FAILURE);
        });
    }

    useEffect(() => {
        superGroupService.getSuperGroupMappings().then(res => {
            const journalMap: { [key: string]: string } = {
                [EXPORT_PLACEHOLDER]: ''
            };
            for (const [key, value] of Object.entries(res.data)) {
                if (key !== GROUP_NAME) {
                    journalMap[key] = value as string;
                }
            }

            setJournalUrlMap(journalMap);
            setSelectedJournal(EXPORT_PLACEHOLDER);
        });
    }, [props.submissionId]);

    return (
      <div>
          <Row>
              <Col xs={7}>
                  <OverlayTrigger
                    placement='top'
                    overlay={<Popover>
                        <Popover.Header>
                            Journal
                        </Popover.Header>
                        <Popover.Body>
                            Select the journal to export this submission to.
                        </Popover.Body>
                    </Popover>}>
                  <Form.Select
                      className="mb-3"
                      onChange={e => {
                          setSelectedJournal((e.target as any).value);
                          setExportStatus(ExportStatus.NONE);
                      }}
                  >
                      {Object.keys(journalUrlMap).map(g => <option key={g}>{g}</option>)}
                  </Form.Select>
                  </OverlayTrigger>
              </Col>

              <Col xs="auto">
                  <OverlayTrigger
                        placement='top'
                        overlay={<Tooltip>
                            Export this submission and all its metadata to another journal.
                        </Tooltip>}>
                  <Button
                      variant="outline-primary"
                      disabled={selectedJournal === EXPORT_PLACEHOLDER}
                      onClick={exportSubmission}
                  >Export</Button>
                  </OverlayTrigger>
              </Col>


              <Col xs="auto">
                  {getExportText()}
              </Col>
          </Row>
      </div>
    );
}