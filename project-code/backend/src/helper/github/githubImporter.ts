import axios from "axios";

export interface IGitHubImporter {
    importZip(owner: string, repo: string): Promise<ArrayBuffer>;
}

export class GitHubImporter implements IGitHubImporter {

    /**
     * Imports a zip file from a GitHub repo.
     * @param owner The owner of the Github repository.
     * @param repo The GitHub repository id.
     * @returns Promise that resolves with the contents of the repo.
     */
    importZip(owner: string, repo: string): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>(resolve => {
            const url = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
            axios.get(url, {
                responseType: "arraybuffer"
            }).then(response => {
                if (response.status === 200 && response.data) {
                    resolve(response.data);
                } else {
                    throw new Error("couldn't download zip");
                }
            });
        })
    }
}