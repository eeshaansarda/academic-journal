import {Form} from "react-bootstrap";
import {ErrorMessage} from "formik";

/**
 * @property name the name of the field in the form where we are displaying an error message
 */
interface ErrorFeedBackProps {
    name: string;
}

/**
 * Component for displaying an error message within a form.
 *
 * @param name the name of the field that we are showing the error message for.
 */
export const ErrorFeedback = ({ name }: ErrorFeedBackProps) => {
    return (
        <ErrorMessage name={name}>
            {msg => (<Form.Control.Feedback style={{display: msg.trim() ? 'block': 'hidden'}} type="invalid">
                {msg}
            </Form.Control.Feedback>)}
        </ErrorMessage>);
}