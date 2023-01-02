import {useParams} from "react-router-dom";
import {useState} from "react";
import CodeHighlighter from "@components/codeHighlighter/CodeHighlighter";
import * as path from "path";
import {Tab, Tabs} from "react-bootstrap";
import ViewFileProps from '@components/submission/view/viewFileProps';

interface FileParam {
    submission: string;
    pathToFile: string;
}

enum ActiveTabs {
    CODE,
    COMMENTS,
    ADD_COMMENT
}

export function ViewTextFile(props: ViewFileProps) {
    const { file } = props;
    const params = useParams<FileParam>();
    const [activeTab, setActiveTab] = useState(ActiveTabs.CODE);

    return (
        <div>
            <Tabs activeKey={activeTab} onSelect={(k: any) => setActiveTab(k)}>
                <Tab eventKey={ActiveTabs.CODE} title="Code">
                    {file ? <CodeHighlighter payload={file.content} extension={path.extname(params.pathToFile)}  startLineNumber={1} /> : null}
                </Tab>
            </Tabs>
        </div>
    );
}