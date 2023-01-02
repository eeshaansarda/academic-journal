import {ErrorIcon} from "@components/icon/Icons";

/**
 * Component to display when there are no bans
 * in the system
 */
const NoBans = () => (<div className="text-muted text-center">
    <h2><ErrorIcon /></h2>
    <h2>No Bans Found</h2>
</div>);

export default NoBans;