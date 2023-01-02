import axios, {AxiosResponse} from "axios";

const BOOT_SWATCH_API = "https://bootswatch.com/api/5.json";

interface IBootSwatchService {
   getThemes: () => Promise<AxiosResponse>;
}

export default class BootSwatchService implements IBootSwatchService{
    getThemes(): Promise<AxiosResponse> {
        return axios.get(BOOT_SWATCH_API);
    }
}