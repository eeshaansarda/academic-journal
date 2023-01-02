import {Col, Row, Form, Spinner, Button} from "react-bootstrap";
import {BackIcon, GitHubIcon, SuccessIcon} from "@components/icon/Icons";
import React, {useState} from "react";
import {GitHubService} from "@services/github/githHubService";

/**
 * @property error whether or not an error occurred
 * @property onChange event to fire when the value has changed
 * @property event that is fired when press close
 */
interface GitHubFieldProps {
    error?: string;
    onChange: (user: string, repo: string) => void;
    onReturn: () => void;
}

export default function GitHubFields({ error, onChange, onReturn }: GitHubFieldProps) {
    const gitHubService = new GitHubService();

    const [user, setUser] = useState("");
    const [repo, setRepo] = useState("");

    const [valid, setValid] = useState(false);
    const [loading, setLoading] = useState(false);

    function onInputChange () {
        setLoading(true);
        gitHubService.getRepository(user, repo).then(res => {
            if (res.status === 200) {
                setValid(true);
            } else {
                setValid(false);
            }
        }).catch(_ => setValid(false)).finally(() => {
            setLoading(false);
        });
    }

    function onUserInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUser(e.target.value);
        onChange(e.target.value, repo);
    }

    function onRepoInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setRepo(e.target.value);
        onChange(user, e.target.value);
    }

    return (<>
        <Row>
            <Col>
                <Row>
                    <Col>
                        <Row>
                            <Col className="d-flex">
                                <Row>
                                    <Form.Group as={Col}>
                                        <Form.Label>
                                            <GitHubIcon /> User
                                        </Form.Label>

                                        <Form.Control name="owner" type="text" onChange={onUserInputChange} onBlur={onInputChange} />
                                        <Form.Text muted>Enter the unique username of the user the repo belongs to (case sensitive).</Form.Text>
                                    </Form.Group>
                                    <Form.Group as={Col}>
                                        <Form.Label>
                                            <GitHubIcon /> Repo
                                        </Form.Label>

                                        <Form.Control name="repoName" type="text" onChange={onRepoInputChange} onBlur={onInputChange} />
                                        <Form.Text muted>
                                            Enter the repo name that you would like to import when creating the submission (case-sensitive).
                                        </Form.Text>
                                    </Form.Group>
                                </Row>
                                <Button className="me-2" variant="link" onClick={onReturn}>
                                    <BackIcon />
                                </Button>
                            </Col>

                        </Row>
                        <Form.Control.Feedback type="invalid">
                            {error}
                        </Form.Control.Feedback>
                    </Col>
                </Row>
                <Row>
                    <Col>
                       <Spinner animation='border' style={{display: loading ? 'block' : 'none'}} />
                        { valid ? <span style={{color: 'green'}}><SuccessIcon /></span> : null }
                    </Col>
                </Row>
            </Col>

        </Row>
    </>);
}
