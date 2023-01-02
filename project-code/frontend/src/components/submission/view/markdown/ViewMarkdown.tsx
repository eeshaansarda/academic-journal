import ReactMarkdown from "react-markdown";
import ViewFileProps from '@components/submission/view/viewFileProps';

export function ViewMarkdown({ file }: ViewFileProps) {
    return (<div>
        <ReactMarkdown>{file.content}</ReactMarkdown>
    </div>);
}

