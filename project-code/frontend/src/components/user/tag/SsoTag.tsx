import {Badge} from "react-bootstrap";

interface SsoTagProps {
    team: string;
}

/**
 * Bootstrap pill to indicate the user is an SSO user
 * @param team the name of the team selected
 */
export default function SsoTag({ team }: SsoTagProps) {
    return <>
        <Badge pill bg="primary">
            {team}
        </Badge>
    </>;
}