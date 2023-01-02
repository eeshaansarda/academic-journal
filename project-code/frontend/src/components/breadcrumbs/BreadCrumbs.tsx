import * as path from "path";
import { Button } from "react-bootstrap";

interface BreadCrumbsProps {
    pathToFile: string;
    onPathClick: (path: string) => void;
}

/**
 * Represents a folder. Folder consists of the name
 * and the path to it
 */
interface Folder {
    folderName: string;
    pathToFolder: string;
}

/**
 * This is the root folder. Mark it by a tilde.
 */
const rootFolder: Folder = {
    folderName: "~",
    pathToFolder: "/"
};

/**
 * Convert the path into a set of folders.
 *
 * @param pathToFile the path of the current working directory.
 */
function pathToFolders(pathToFile: string) : Folder[] {
    if (pathToFile.trim() === '/')
        return [rootFolder];

    // Split the path into its folders. Work through the list of folders. Use reduce as
    // we need to know the value of the previous folder
    const folders = pathToFile.split('/').reduce<Folder[]>((currentList, currentValue) => {
        // If the folder is has no name do not insert into the list
        if (currentValue.trim() === '')
            return currentList;

        // Get the path of the parent folder return null if doesn't exist
        let parentPath = currentList.length !== 0 ? currentList[currentList.length - 1].pathToFolder : null;

        // Calculate the new path based off the parent folder
        const newPath = (parentPath === null) ? currentValue : path.join(parentPath, currentValue);

        const folder : Folder = {
            folderName: currentValue,
            pathToFolder: newPath
        };

        return [...currentList, folder];
    }, []);

    folders.unshift(rootFolder);

    return folders;
}

/**
 * Component for displaying the hierarchy in the file.
 *
 * @param pathToFile the current path we are displaying
 * @param onPathClick fire an event when a parent element
 * in the paths has been clicked.
 */
export default function BreadCrumbs({ pathToFile, onPathClick } : BreadCrumbsProps) {
    const folders = pathToFolders(pathToFile);

    const breadCrumbs = folders.map((folder) => {
        return (
            <span key={folder.pathToFolder}>
                <Button variant="link" onClick={() => { onPathClick(folder.pathToFolder)}}>{folder.folderName}</Button>
                <span>/</span>
            </span>
        )
    });

    return (
        <div>
            {breadCrumbs}
        </div>
    );
}