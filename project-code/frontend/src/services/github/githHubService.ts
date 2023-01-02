import axios, {AxiosResponse} from "axios";

export interface IGitHubService {
    getRepository: (user: string, repo: string) => Promise<AxiosResponse>;
}

export class GitHubService implements IGitHubService {
    getRepository(user: string, repo: string): Promise<AxiosResponse> {
        return axios.get(`https://api.github.com/repos/${user}/${repo}`);
    }
}
