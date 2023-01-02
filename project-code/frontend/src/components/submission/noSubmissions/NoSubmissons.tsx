import {Link} from "react-router-dom";
import * as paths from "@config/paths";
import {ErrorIcon} from "@components/icon/Icons";

interface NoSubmissionsProps {
    showCreate?: boolean;
}

export default function NoSubmissions({ showCreate = true }: NoSubmissionsProps) {
    return (<div className="text-muted text-center">
        <h2><ErrorIcon /></h2>
        <h2>No Submissions Found</h2>

        {showCreate ? <p>Create one <Link to={`${paths.newSubmissionPath}`}>here</Link></p> : null}
    </div>);
}