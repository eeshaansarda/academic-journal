import {useSelector} from "react-redux";
import {selectUser} from "@slices/userSlice";

/**
 * @property author id of the author
 * @property children the component to render
 */
interface AuthorRestrictedProps {
    author: string;
    children?: JSX.Element | JSX.Element[];
}

/**
 * Component for restricting access to only authors (the uploader of the submission)
 * @param props
 */
export default function AuthorRestricted(props: AuthorRestrictedProps) {
    const user = useSelector(selectUser);

    if (!user || user.id !== props.author)
        return null;

    return (
        <>
            {props.children}
        </>);
}