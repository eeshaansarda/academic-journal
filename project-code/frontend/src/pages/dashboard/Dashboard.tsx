import {Layout, Layouts, Responsive, WidthProvider} from "react-grid-layout";
import Event, {useEffect, useState} from "react";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {DashboardAdder} from "@components/dashboard/DashboardAdder";
import CardWithOptions from "@root/components/cards/CardWithOptions";
import {WidgetTypes} from "@components/dashboard/widgetTypes";
import DashboardWidget from "@components/dashboard/widgets/DashboardWidget";
import SubmissionWidget from "@components/dashboard/widgets/submission/SubmissionWidget";
import {DashboardService} from "@services/dashboard/dashboardService";
import {selectUser} from "@slices/userSlice";
import {useSelector} from "react-redux";
import ReviewWidget from "@components/dashboard/widgets/reviews/ReviewWidget";
import ReportsWidget from "@components/dashboard/widgets/reports/ReportsWidget";
import PublicationWidget from "@components/dashboard/widgets/publication/PublicationWidget";
import NoReviewersWidget from "@components/dashboard/widgets/noReviewers/NoReviewersWidget";
import BansWidget from "@components/dashboard/widgets/bans/BansWidget";
import {Col, Container, Row} from "react-bootstrap";
import {ErrorIcon} from "@components/icon/Icons";

const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * Given a unique component id this method extracts the name of the widget.
 * All widgets are identified such as `submission-widget#1' so we need to extract
 * only the `submission-widget' part.
 * @param i
 */
function getItemId(i: string) {
     return i.substring(0, i.indexOf('#'));
}

/**
 * Given an id that uniquely represents the component get the corresponding widget
 * @param itemId the id of the widget in the dashboard
 * @param onDelete the event fired when we delete the component
 */
function getWidgetFromId(itemId: string, onDelete: (id: string | null) => void) {
    const type = getItemId(itemId);
    switch (type) {
        case WidgetTypes.SUBMISSION_LIST:
            return (<DashboardWidget key={itemId} onDelete={onDelete} widgetId={itemId} title="Submissions"><SubmissionWidget /></DashboardWidget>);
        case WidgetTypes.REVIEWS_LIST:
            return (<DashboardWidget key={itemId} onDelete={onDelete} widgetId={itemId} title="Reviews"><ReviewWidget /></DashboardWidget>)
        case WidgetTypes.PUBLICATIONS_LIST:
            return (<DashboardWidget key={itemId} onDelete={onDelete} widgetId={itemId} title="Publications"><PublicationWidget /></DashboardWidget>)
        case WidgetTypes.BANS_LIST:
            return (<DashboardWidget key={itemId} onDelete={onDelete} widgetId={itemId} title="Bans"><BansWidget /></DashboardWidget>)
        case WidgetTypes.REPORTS_LIST:
            return (<DashboardWidget key={itemId} onDelete={onDelete} widgetId={itemId} title="Report"><ReportsWidget /></DashboardWidget>)
        case WidgetTypes.SUBMISSIONS_WITH_NO_REVIEWERS:
            return (<DashboardWidget key={itemId} onDelete={onDelete} widgetId={itemId} title="Submissions With No Reviewers"><NoReviewersWidget /></DashboardWidget> )
        default:
            throw new Error("widget does not exist")
    }
}

const NoWidgets = () => <Container fluid>
    <Row>
        <Col className="d-flex justify-content-center text-muted">
            <h3><ErrorIcon size="lg" /></h3>
        </Col>
    </Row>
    <Row>
        <Col className="d-flex justify-content-center text-muted">
            <p>No widgets added! Add a widget to enhance your workflow!</p>
        </Col>
    </Row>
</Container>

export function Dashboard() {
    const [layouts, setLayouts] = useState<Layouts>({ lg: [], md: [], sm: [], xs:[], xxs: []});
    const [droppedItem, setDroppedItem] = useState<WidgetTypes | "">("");
    const [showWidgetList, setShowWidgetList] = useState(false);
    const [currentBreakPoint, setCurrentBreakPoint] = useState("lg");
    const user = useSelector(selectUser);

    const dashboardService = new DashboardService();

    /**
     * When we select a dropdown element from the hamburger button get the key of the value
     * clicked and perform a corresponding action
     *
     * @param value the key of the element clicked
     */
    function onCardOptionsSelected(value: string | null) {
        if (value === "Add Widget")
            setShowWidgetList(true);
    }

    function getDashboard() {
        if (!user)
            return;

        dashboardService.getDashboard().then(res => {
           if (res.data && res.data.status === "success") {
               const layouts : Layouts = JSON.parse(res.data.dashboard);
               setLayouts(layouts);
           }
        });
    }

    function setDashboard(dashboardLayouts: Layouts | Layout[]) {
        dashboardService.setDashboard(JSON.stringify(dashboardLayouts));
    }

    /**
     * On deleted remove the card from all elements in each layout
     * @param itemId the id of the widget deleted
     */
    function onCardDeleted(itemId: string | null) {
        if (!itemId)
            return;

        const newLayouts = { ...layouts };
        Object.keys(newLayouts).forEach(key => {
            newLayouts[key] = newLayouts[key].filter(item => item.i !== itemId);
        });

        setLayouts(newLayouts);
    }

    /**
     * onDrop generate a unique id for the widget and add it to each
     * layout.
     *
     * @param layout the list of responsive layouts
     * @param itemAdded the item that was added
     * @param e
     */
    function onDrop(layout: Layout[], itemAdded: Layout, e: Event) {
        const numOfItem = layouts[currentBreakPoint].reduce((prev, current) => {
            return getItemId(current.i) === droppedItem ? prev + 1 : prev;
        }, 0);

        const droppedItemReplace = layout.map(item => ({...item, i: item.i === "__dropping-elem__" ? `${droppedItem}#${numOfItem}`: item.i}));

        const newLayout = { ...layouts };
        Object.keys(newLayout).forEach(key => newLayout[key] = droppedItemReplace);
        newLayout[currentBreakPoint] = droppedItemReplace;

        setLayouts(newLayout);
    }

    function generateDOM() {
        return layouts[currentBreakPoint].map(item => {
            return <div key={item.i}>
                {getWidgetFromId(item.i, onCardDeleted)}
            </div>
        });
    }

    useEffect(() => {
        if (user)
            getDashboard();
    }, [user]);

    function onLayoutChange(newLayout: Layout[]) {
        const newLayouts: Layouts = {...layouts};
        newLayouts[currentBreakPoint] = newLayout;
        setDashboard(newLayouts);
    }

    return (
        <div style={{height: '100%'}}>
            {layouts[currentBreakPoint].length === 0 ? <NoWidgets /> : <></>}
            <DashboardAdder onItemDragged={setDroppedItem} onHide={() => setShowWidgetList(false)} show={showWidgetList} />
            <CardWithOptions style={{minHeight: '75%'}} onSelected={onCardOptionsSelected} title="Dashboard" options={["Add Widget"]} >
                <ResponsiveGridLayout
                    onBreakpointChange={(newBreakpoint) => setCurrentBreakPoint(newBreakpoint)}
                    layouts={layouts}
                    cols={{lg: 6, md: 5, sm: 3, xs: 2, xxs: 1}}
                    verticalCompact={true}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0  }}
                    rowHeight={400}
                    isResizable={true}
                    resizeHandles={['se']}
                    onDrop={onDrop}
                    isDroppable={true}
                    onLayoutChange={(layout,_) => onLayoutChange(layout)}>
                    {generateDOM()}
                </ResponsiveGridLayout>
            </CardWithOptions>
        </div>
    );
}