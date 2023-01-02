import {FormControl, InputGroup} from "react-bootstrap";
import {SearchIcon} from "@components/icon/Icons";
import {useHistory} from "react-router-dom";
import {KeyboardEvent, useState} from "react";
import {publicationsPath} from "@config/paths";

/**
 * Component for searching for publications within the system
 */
export default function SearchPublications() {
    const [searchValue, setSearchValue] = useState("");
    const history = useHistory();

    function onEnter(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            history.push(`${publicationsPath}?search=${searchValue}`);
            setSearchValue("");
        }
    }

    return (
        <InputGroup>
            <InputGroup.Text>
                <SearchIcon />
            </InputGroup.Text>
            <FormControl placeholder="Search" value={searchValue} onChange={e => setSearchValue(e.target.value)} onKeyDown={onEnter} />
        </InputGroup>
    );
}