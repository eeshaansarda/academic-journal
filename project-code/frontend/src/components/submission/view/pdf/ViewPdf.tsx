import ViewFileProps from '@components/submission/view/viewFileProps';

export function ViewPdf({ file }: ViewFileProps) {
    return (<div>
        <embed
            style={{width: "100%", height: "50rem"}}
            src={`data:${file.contentType};base64, ${file.content}`}
        />
    </div>)
}