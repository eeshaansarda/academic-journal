import {useState} from "react";
import {UserService} from "@services/user/userService";
import Select, {SingleValue} from "react-select";

export interface Institution {
    value: string;
    label: string;
}

/**
 * @property institution the name of the institution selected
 * @property onInstitutionChange event that is fired when we change the institution
 */
interface InstitutionFieldProps {
    institution: string;
    onInstitutionChange: (inst: string) => void;
}

/**
 * Represents the institution form field
 *
 * @param props
 * @constructor
 */
export default function InstitutionField(props: InstitutionFieldProps) {
    const [ institutions, setInstitutions ] = useState<Institution[]>([]);

    const userService = new UserService();

    const NO_INSTITUTION = 'No Institution';

    const loadInstitutions = (searchTerm: string) => {
        userService.getInstitutions(searchTerm)
            .then(res => {
                if (res.data) {
                    setInstitutions([{ value: NO_INSTITUTION, label: NO_INSTITUTION }, ...res.data.map((i: any) => ({ value: i.name, label: i.name }))]);
                }
            })
            .catch(_ => {});
    }

    function getInstitution(e: SingleValue<{ value: string, label: string }>) {
        if (e?.value) {
            return e.value === NO_INSTITUTION ? '' : e.value;
        }

        return '';
    }

    return <>
        <Select
            options={institutions}
            value={{ value: props.institution, label: props.institution }}
            onChange={e => props.onInstitutionChange(getInstitution(e))}
            onKeyDown={e => loadInstitutions((e as any).target.value)}
        />
    </>;
}