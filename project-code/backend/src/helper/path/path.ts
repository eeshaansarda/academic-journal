import * as path from "path";
import fs from "fs";

export interface IFileUtilities {
    fileExists: (pathToFile: string) => Promise<boolean>;
    isPathAncestor: (ancestorPath: string, childPath: string) => boolean;
}

export class FileUtilities implements IFileUtilities {

    /**
     * Checks if a file exists.
     * @param pathToFile The path to the file.
     * @returns Promise that resolves with whether the file exists.
     */
    public async fileExists(pathToFile: string): Promise<boolean> {
        try {
            await fs.promises.access(pathToFile, fs.constants.R_OK);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Checks if a path is an ancestor of another path.
     * @param ancestorPath The ancestor path.
     * @param childPath The child path.
     * @returns Whether it is an ancestor path.
     */
    public isPathAncestor(ancestorPath: string, childPath: string): boolean {
        const relativePath = path.relative(ancestorPath, childPath);
        return !relativePath.startsWith('..') && !path.isAbsolute(relativePath) && relativePath != ancestorPath;
    }
}