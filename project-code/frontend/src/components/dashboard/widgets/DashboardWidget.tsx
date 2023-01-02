import CardWithOptions from "@components/cards/CardWithOptions";
import React from "react";

interface DashboardWidgetProps {
    onDelete: (id: string) => void;
    widgetId: string;
    children?: JSX.Element | JSX.Element[];
    title: string;
    minHeight?: number;
    minWidth?: number;
}

const DELETE_COMMAND = "Delete";

/**
 * Component that represents an individual widget within the dashboard.
 * Each widget has an id that identifies within the dashboard
 */
export default function DashboardWidget(props: DashboardWidgetProps) {
    /**
     * Event that is fired when the context menu is clicked
     * @param command the command being executed
     */

    function onContextMenuPressed(command: string | null) {
        if (command === DELETE_COMMAND)
            props.onDelete(props.widgetId);
    }

    return (
        /**
         * Render a card with options as the base for the dashboard widget.
         */
        <CardWithOptions style={{height: 'inherit'}}
                         options={[DELETE_COMMAND]}
                         onSelected={onContextMenuPressed} title={props.title}>
            {props.children}
        </CardWithOptions>
    );
}