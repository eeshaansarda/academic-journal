import {useSelector} from "react-redux";
import {selectUser} from "@slices/userSlice";
import {uniq} from "lodash";
import {Author, CoAuthor} from "@responses/submission";

/**
 *
 */
interface CollaboratorRestrictedProps {
    collaborators: CoAuthor[];
    author: Author;
    children?: JSX.Element | JSX.Element[];
}

/**
 * Component for restricting access to only collaborators of the submission (authors and coAuthors)
 *
 * @param collaborators the collaborators of teh submission
 * @param author the author of the submission
 * @param children child components to render
 */
export default function CollaboratorRestricted({ collaborators, author, children }: CollaboratorRestrictedProps) {
    const user = useSelector(selectUser);

    if (!user || (user.id !== author.id && uniq(collaborators.map(c => c.id)).indexOf(user.id) === -1))
        return null;

    return <>
        {children}
    </>;
}