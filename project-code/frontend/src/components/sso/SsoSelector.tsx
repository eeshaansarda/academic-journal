import {SuperGroupService} from "@services/superGroup/superGroupService";
import {SyntheticEvent, useEffect, useState} from "react";
import {Form, ListGroup} from "react-bootstrap";
import {v4 as uuid} from "uuid";
import {GROUP_NAME} from "@config/constants";

const SSO_COOKIE_NAME = 'sso';
const FIVE_MINUTES_IN_SECOND = 5 * 60;

/**
 * Component for selecting a journal that allows us to log into
 * our journal from the federation
 */
export default function SsoSelector() {
    const superGroupService = new SuperGroupService();
    const [journalUrlMap, setJournalUrlMap] = useState<{ [key: string]: string}>({});

    useEffect(() => {
        superGroupService.getSuperGroupMappings().then(res => {
            setJournalUrlMap(res.data);
        });
    }, []);

    function onSelectJournal(e: SyntheticEvent, selectedJournal: string) {
        e.preventDefault();

        const journalUrl = journalUrlMap[selectedJournal];

        const state = uuid();
        const ssoData = {
            state: state,
            url: journalUrl
        };

        // Generating a new state that will be read when returning to our journal that the state has not been modified
        document.cookie = `${SSO_COOKIE_NAME}=${JSON.stringify(ssoData)};max-age=${FIVE_MINUTES_IN_SECOND}`;
        const ssoUrl = `${journalUrl}/api/sg/sso/login?from=${journalUrlMap[GROUP_NAME]}&state=${state}`;
        window.location.href = ssoUrl;
    }

    function renderJournalOptions() {
        return Object.entries(journalUrlMap).map(([key, _]) =>
            <ListGroup.Item action key={key} onClick={(e) => onSelectJournal(e, key)}>{key}</ListGroup.Item>);
    }

    return (
        <div>
            <ListGroup style={{width: '100%'}}>
                {renderJournalOptions()}
            </ListGroup>
            <Form.Text>
                You can alternatively login with an external journal in SuperGroup C.
            </Form.Text>
        </div>
    );
}



