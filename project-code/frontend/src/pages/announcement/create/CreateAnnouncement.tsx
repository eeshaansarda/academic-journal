import {Button, Container, Form} from "react-bootstrap";
import {AnnouncementIcon} from "@components/icon/Icons";
import React, {useState} from "react";
import {EditorState} from "draft-js";
import {AnnouncementService} from "@services/announcement/announcementService";
import {useHistory} from "react-router-dom";
import {announcementPath} from "@config/paths";
import {Formik} from "formik";
import RichTextEditor from "@components/richTextEditor/RichTextEditor";
import {getContentValidation, getTitleValidation} from "@root/validations/announcement/announcementValidation";
import {ErrorFeedback} from "@components/forms/ErrorFeedback";

export interface AnnouncementForm {
    title: string;
    content: string;
}

interface AnnouncementFormErrors {
    title?: string;
    content?: string;
}

export default function CreateAnnouncement() {
    const [ editorState, setEditorState ] = useState(() => EditorState.createEmpty());
    const announcementService = new AnnouncementService();
    const history = useHistory();

    const validateForm = (values: AnnouncementForm) => {
        const errors : AnnouncementFormErrors = {};
        let titleError = getTitleValidation(values.title);
        let contentError = getContentValidation(values.content);

        if (titleError)
            errors.title = titleError;

        if (contentError)
            errors.content = contentError;

        return errors;
    }

    const announcementFormSubmitted = async (values: AnnouncementForm) => {
        announcementService.createAnnouncement(values).then(res => {
            if (res.data && res.data.status === "success") {
                const url = announcementPath.replace(':announcementId', res.data.announcementId);
                history.push(url);
            }
        });
    };

    return (
        <Container>
            <h2 className="mb-3 mt-3"><AnnouncementIcon /> New Announcement</h2>
            <Formik
                initialValues={{
                    title: '',
                    content: ''
                }}
                validate={validateForm}
                onSubmit={announcementFormSubmitted}>
                {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    errors,
                    setFieldValue
                }) => (
                    <Form noValidate onSubmit={handleSubmit} className="mt-4 announcement-form">
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                placeholder="Title"
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                            <Form.Text muted>
                                Give the announcement a heading to grab the user's attention.
                            </Form.Text>

                            <ErrorFeedback name="title" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Content</Form.Label>
                            <RichTextEditor name="content"
                                            editorState={editorState}
                                            onEditorStateChanged={setEditorState}
                                            onChange={val => setFieldValue('content', val)} />
                            <Form.Text muted>
                                Add content to the announcement. This is the actual details of the announcement that you would like
                                to convey to the user.
                            </Form.Text>

                            <ErrorFeedback name="content" />
                        </Form.Group>

                        <Button type="submit">Create</Button>
                    </Form>
                )}

            </Formik>
        </Container>
    );
}