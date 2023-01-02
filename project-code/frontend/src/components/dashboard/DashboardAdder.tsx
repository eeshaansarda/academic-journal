import {Offcanvas} from "react-bootstrap";
import WidgetSummaryComponent from "@components/dashboard/WidgetSummaryComponent";
import {WidgetTypes} from "@components/dashboard/widgetTypes";
import {AddIcon, AdminIcon, BanIcon, PublishedIcon, ReviewIcon, SubmissionIcon, ToDoIcon} from "@components/icon/Icons";
import {UserRole} from "@role/role";

/**
 * @property show or not to show the adder
 * @property event that is fired when the dashboard adder is hidden
 * @property onItemDragged event that is fired when an item from the adder is draagged.
 */
interface DashboardAdderProps {
    show: boolean;
    onHide: () => void;
    onItemDragged: (item: WidgetTypes) => void;
}

/**
 * Component for adding a set of widgets to the dashboard.
 *
 * @param show whether or not to show the adder
 * @param onHide event that is fired when it is hidden
 * @param onItemDragged event that is fired when an item is dragged
 * @constructor
 */
export function DashboardAdder({ show, onHide, onItemDragged }: DashboardAdderProps) {
    /*
     * Set of widgets we can show to the dashboard
     */
    const widgets = [
        <WidgetSummaryComponent key={WidgetTypes.PUBLICATIONS_LIST}
                                type={WidgetTypes.PUBLICATIONS_LIST}
                                icon={<PublishedIcon />}
                                title="Your Publications"
                                description="The submissions that have been approved"
                                onDrag={onItemDragged} />,
        <WidgetSummaryComponent key={WidgetTypes.SUBMISSION_LIST}
                                type={WidgetTypes.SUBMISSION_LIST}
                                icon={<SubmissionIcon />}
                                title="Your Submissions"
                                description="The submissions you have open"
                                onDrag={onItemDragged} />,
        <WidgetSummaryComponent key={WidgetTypes.REVIEWS_LIST}
                                type={WidgetTypes.REVIEWS_LIST}
                                icon={<ReviewIcon />}
                                title="Your Reviews"
                                description="The reviews you are yet to decide"
                                onDrag={onItemDragged} />,
        <WidgetSummaryComponent key={WidgetTypes.REPORTS_LIST}
                                type={WidgetTypes.REPORTS_LIST}
                                icon={<AdminIcon />}
                                title="Reports"
                                description="View reports on the system"
                                roleRestricted={UserRole.ADMIN}
                                onDrag={onItemDragged} />,
        <WidgetSummaryComponent key={WidgetTypes.SUBMISSIONS_WITH_NO_REVIEWERS}
                                type={WidgetTypes.SUBMISSIONS_WITH_NO_REVIEWERS}
                                icon={<ToDoIcon />}
                                title="Submissions With no Reviewers"
                                description="All Submissions That Are Yet To Have Reviewers Assigned"
                                onDrag={onItemDragged}
                                roleRestricted={UserRole.EDITOR} />,
        <WidgetSummaryComponent key={WidgetTypes.BANS_LIST}
                                type={WidgetTypes.BANS_LIST}
                                icon={<BanIcon />}
                                title="Banned Users"
                                description="Banned Users In The System"
                                onDrag={onItemDragged}
                                roleRestricted={UserRole.ADMIN} />
    ];

    return (
        <Offcanvas placement="end" show={show} scroll={true} backdrop={false} onHide={onHide}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>
                    <AddIcon /> Add Widget
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {widgets}
            </Offcanvas.Body>
        </Offcanvas>
    );
}