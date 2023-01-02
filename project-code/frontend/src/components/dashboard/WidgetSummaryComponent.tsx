import {WidgetTypes} from "@components/dashboard/widgetTypes";
import {Card} from "react-bootstrap";
import React from "react";
import {UserRole} from "@role/role";
import {RoleRestricted} from "@components/roleRestricted/RoleRestricted";

/**
 * @property type the type of widget being added
 * @property icon the icon of the widget being added
 * @property title the title of the widget
 * @property description the description of the widget
 * @property onDrag event that is fired when an element is dragged
 * @property roleRestricted whether or not a user should be able to see this with the given role
 */
interface AddWidgetProps {
    type: WidgetTypes;
    icon: React.ReactNode;
    title: string;
    description: string;
    onDrag: (value: WidgetTypes) => void;
    roleRestricted?: UserRole;
}

/**
 * Component that is used to add a widget to the dashboard.
 *
 * @param props arguments passed into the component
 */
export default function WidgetSummaryComponent(props: AddWidgetProps) {
    const card = (
        <Card draggable onDrag={() => props.onDrag(props.type)} className="m-2">
            <Card.Title>
                {props.icon}
            </Card.Title>
            <Card.Text className="text-muted">
                {props.description}
            </Card.Text>
        </Card>
    );

    if (props.roleRestricted)
        return (
            <RoleRestricted roleRequired={props.roleRestricted}>
                {card}
            </RoleRestricted>
        );

    return card;
}

