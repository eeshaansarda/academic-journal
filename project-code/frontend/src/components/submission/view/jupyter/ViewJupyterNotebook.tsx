import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import ViewFileProps from '@components/submission/view/viewFileProps';
import { Cell, isCodeCell, isMarkdownCell } from "@components/submission/view/jupyter/notebook/cell";
import { CodeOutput, isDisplayDataOutput, isErrorOutput, isExecutionResultOutput, isStreamOutput } from "@components/submission/view/jupyter/notebook/codeOutput";
import { Notebook } from "@components/submission/view/jupyter/notebook/notebook";
import Prism from "prismjs";

/**
 * Jupyter document viewer component.
 * @param props The properties.
 * @returns The component.
 */
export default function ViewJupyterNotebook(props: ViewFileProps) {
    const notebook = JSON.parse(props.file.content) as Notebook;

    /**
     * Displays the row for a single cell in the document.
     * @param cell The cell.
     * @returns The row component.
     */
    const displayCellRow = (cell: Cell) => {
        return (
            <Row style={{
                marginBottom: '20px'
            }}>
                <Row>
                    <Col 
                        xs="auto">
                        <div style={{ 
                            width: 80,
                            paddingTop: '5px',
                            marginRight: '-18px',
                            textAlign: 'right',
                            color: '#333f99'
                        }}>
                            {isCodeCell(cell)
                                ? `In [${cell.execution_count == undefined ? ' ' :  cell.execution_count}]:`
                                : ''
                            }
                        </div>
                    </Col>

                    <Col>
                        {displayCellContent(cell)}
                    </Col>
                </Row>

                <Row style={
                    { 
                        marginTop: isCodeCell(cell) && cell.outputs.length > 0 ? '2px' : '0px'
                    }}>
                    <Col 
                        xs="auto">
                        <div style={{ 
                            width: 80,
                            marginRight: '-18px',
                            textAlign: 'right',
                            color: '#c84e29'
                        }}>
                            {isCodeCell(cell)
                                ? cell.outputs.map(o => isExecutionResultOutput(o)
                                    ? `Out [${o.execution_count == undefined ? ' ' : o.execution_count}]:`
                                    : '').join('\n')
                                : ''
                            }
                        </div>
                    </Col>
                    <Col>
                        {isCodeCell(cell)
                            ? truncateOutput(cell.outputs.map(o => displayOutput(o)).join('\n'))
                            : ''
                        }
                    </Col>
                </Row>
            </Row>
        )
    };

    /**
     * Displays the content of a cell.
     * @param cell The cell.
     * @returns The component.
     */
    const displayCellContent = (cell: Cell) => {
        if (isCodeCell(cell)) {
            const formattedLines = cell.source
                .map(line => Prism.highlight(line, Prism.languages['python'], 'python'));
            const content = formattedLines.join('<br/>');
            return (
                <div style={{
                    width: '100%',
                    minHeight: '35px',
                    padding: '4px 4px 4px 4px',
                    background: '#f7f7f7',
                    border: '1px solid #cfcfcf',
                    borderRadius: '2px'
                }}
                dangerouslySetInnerHTML={{ __html: content}}/>
            );
        }
        if (isMarkdownCell(cell)) {
            return <ReactMarkdown>{cell.source.join('')}</ReactMarkdown>
        } else {
            return (
                <div style={{
                    width: '100%',
                    minHeight: '35px',
                    padding: '4px 4px 4px 4px',
                    background: '#f7f7f7',
                    border: '1px solid #cfcfcf',
                    borderRadius: '2px'
                }}>
                    {cell.source.map(line => <div>{line}<br/></div>)}
                </div>
            );
        }
    };

    /**
     * Truncates the output of a cell.
     * @param str The output string.
     * @returns The modified output (truncated if necessary).
     */
    const truncateOutput = (str: string) => str.length > 500 
        ? str.slice(0, 500) + '...'
        : str;

    /**
     * Displays an output object.
     * @param output The output object.
     * @returns The component.
     */
    const displayOutput = (output: CodeOutput) => {
        if (isStreamOutput(output)) {
            return output.text;
        } else if (isDisplayDataOutput(output) || isExecutionResultOutput(output)) {
            const textContent = output.data['text/plain'];
            return textContent || '';
        } else if (isErrorOutput(output)) {
            return output.traceback.join('\n');
        } else {
            return '';
        }
    };

    /**
     * Sets the background colour on component load.
     */
    useEffect(() => {
        document.body.style.backgroundColor = '#eeeeee';
    }, []);

    return (
        <div style={{
            background: 'white',
            boxShadow: '0 0 4px 3px #dfdfdf',
            margin: '20px 0 20px 0',
            padding: '20px 5px 20px 5px'
        }}>
            {notebook.cells.map(c => displayCellRow(c))}
        </div>
    );
}