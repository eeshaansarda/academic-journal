import {Alert, Fade} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {selectError} from "@slices/errorSlice";
import ReactDOM from "react-dom";
import {clearError} from "@slices/errorSlice";

const MODE: string = '[MODE]';

/**
 * Global component that displays whenever an axios component products an error
 *
 * @constructor
 */
export default function ErrorHandler() {
    const { error: errorStatus } = useSelector(selectError);
    const dispatch = useDispatch();
    
    if (MODE !== 'production' && errorStatus.error)
        return ReactDOM.createPortal((
            <Alert variant='danger' onClose={() => dispatch(clearError())} style={{position: 'fixed', top: '0px', right: '0px', zIndex: 9999}} transition={Fade} dismissible>
                <Alert.Heading>{errorStatus.error.status}</Alert.Heading>
                <div><pre>{errorStatus.error.message}</pre></div>
            </Alert>
        ), document.body);

    return null;
}

