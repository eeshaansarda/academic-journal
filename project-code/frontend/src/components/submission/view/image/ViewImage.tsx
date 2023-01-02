import ViewFileProps from '@components/submission/view/viewFileProps';

export function ViewImage(props: ViewFileProps) {
    const { file } = props;

    return (<div>
        <img
            style={{maxWidth: "100%"}}
            src={`data:${file.contentType};base64, ${file.content}`}
            alt="Client provided image"
        />
    </div>);
}