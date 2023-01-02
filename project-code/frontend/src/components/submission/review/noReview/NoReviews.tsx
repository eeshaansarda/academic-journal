import {ErrorIcon} from "@components/icon/Icons";

export default function NoReviews() {
    return (<div className="text-muted text-center">
        <h2><ErrorIcon /></h2>
        <h2>No Reviews Found</h2>
    </div>);
}