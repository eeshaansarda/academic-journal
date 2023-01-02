import {Dropdown, DropdownButton, FormControl, InputGroup} from "react-bootstrap";
import {ChangeEvent, useState} from "react";

/**
 * @property eventKey the key of the event taking place
 * @property title the title of the event we are sorting
 */
export interface SortFilter {
    eventKey: string;
    title: string;
}


/**
 * @property filters the filters to sort by
 * @property placeholder the placeholder to display initially
 * @property onFilterChanged event that is fired when we change a filter
 * @property onSearchChange event that is fired when we content in the search changes
 * @property initialValue the initial value of the search box
 */
interface SearchComponentProps {
    filters: SortFilter[];
    placeholder: string;
    onFilterChanged: (eventKey: string) => void;
    onSearchChange: (newValue: string) => void;
    initialValue?: string;
}

/**
 * Component for searching components within the system
 * @param props
 */
export default function SearchComponent(props: SearchComponentProps) {
    const [title, setTitle] = useState<string | null>(null);
    const [sort, setSort] = useState("");

    const isSelected = (key: string) => sort === key;

    function onSelect(e: string | null) {
        if (e) {
            setSort(e);
            props.onFilterChanged(e);
        }
    }

    function onTitleChanged(e: ChangeEvent<HTMLInputElement>) {
        setTitle(e.target.value);
        props.onSearchChange(e.target.value);
    }


    const value = title !== null ? title : (props.initialValue ?? "");

    return (<InputGroup>
        <FormControl placeholder="Search" value={value} onChange={onTitleChanged}  />
        <DropdownButton title="Sort" variant="outline-primary" onSelect={onSelect}>
            {props.filters.map(filter =>
                <Dropdown.Item key={filter.eventKey} eventKey={filter.eventKey}>{`${isSelected(filter.eventKey) ? '✓': ' '} ${filter.title}`}</Dropdown.Item>
            )}
        </DropdownButton>
    </InputGroup>);
}