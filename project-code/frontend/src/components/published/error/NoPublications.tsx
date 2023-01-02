import {ErrorIcon} from "@components/icon/Icons";

export default function NoPublications() {
    return (<div className="text-muted text-center">
        <h2><ErrorIcon /></h2>
        <h2>No Publications Found</h2>
    </div>);
}