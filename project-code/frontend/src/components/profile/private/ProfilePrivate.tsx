import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {PrivateIcon, PublicIcon} from "@components/icon/Icons";

/**
 * @property public whether or not the field is public
 * @property onSetFieldPublic method for marking the field as private
 * @property onSetFieldPublic method for marking the field as public
 */
interface ProfilePrivateProps {
    public: boolean;
    onSetFieldPrivate: () => void;
    onSetFieldPublic: () => void;
}

/**
 * @property onSetFieldPublic event that is triggered when we mark the field as public
 */
interface PublicFieldButtonProps {
    onSetFieldPublic: () => void;
}

/**
 * Component that represents that the field is public.
 * @param props properties injected into the component
 */
function PublicFieldButton(props: PublicFieldButtonProps) {
    const renderToolTip = (props: any) => (
        <Tooltip {...props}>
            Make this field public
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={renderToolTip}>
            <Button variant="primary" style={{width: '2.5rem'}} onClick={(e) => props.onSetFieldPublic()}>
                <PublicIcon />
            </Button>
        </OverlayTrigger>
    );
}

/**
 * @property onSetFieldPrivate fired when we set the field is private
 */
interface PrivateFieldButtonProps {
    onSetFieldPrivate: () => void;
}

/**
 * Button for marking a field as private
 *
 * @param props properties injected into the component
 */
function PrivateFieldButton(props: PrivateFieldButtonProps) {
    const renderToolTip = (props: any) => (
        <Tooltip {...props}>
            Make this field private
        </Tooltip>
    );

    return (
        <OverlayTrigger overlay={renderToolTip}>
            <Button variant="warning" style={{width: '2.5rem'}} onClick={(e) => props.onSetFieldPrivate()}>
                <PrivateIcon />
            </Button>
        </OverlayTrigger>);
}


export default function ProfilePrivate(props: ProfilePrivateProps) {
    if (props.public)
        return <PrivateFieldButton onSetFieldPrivate={props.onSetFieldPrivate}/>;

    return <PublicFieldButton onSetFieldPublic={props.onSetFieldPublic} />;
}