import {ErrorIcon} from "@components/icon/Icons";

export default function PublicationDoesNotExist() {
    return (<div className="text-muted text-center">
        <h2><ErrorIcon /></h2>
        <h2>Publication Does Not Exist</h2>
    </div>);
}