import {Badge, NavDropdown } from "react-bootstrap";
import React from "react";

/**
 * @property children the children to render
 * @property icon the icon to display
 * @property numNewElements the number of new elements in the dropdown
 * @property noElementsComponent the component that is displayed when there are no elements
 * @property shouldStayOpen whether or not the dropdown should stay open
 */
export interface DropdownProps {
    children: React.ReactNode[];
    icon: React.ReactNode;
    numNewElements: number;
    noElementsComponent: React.ReactNode;
    shouldStayOpen?: boolean;
}

/**
 * Component that represents a navigation dropdown in the TopNavbar.
 *
 * @property children the children to render
 * @property icon the icon to display
 * @property numNewElements the number of new elements in the dropdown
 * @property noElementsComponent the component that is displayed when there are no elements
 * @property shouldStayOpen whether or not the dropdown should stay open
 */
export default function Dropdown({ numNewElements,
                                            icon,
                                            children,
                                            noElementsComponent,
                                            shouldStayOpen
                                        }: DropdownProps) {
    const dropdownIcon = <>
        {icon}
        <Badge pill bg="warning">
            {numNewElements}
        </Badge>
    </>;

    return (
        <NavDropdown 
            data-testid="dropdown" 
            title={dropdownIcon}
            onSelect={(e: any) => {
                if (shouldStayOpen) {
                    e.stopPropagation();
                }
            }}
        >
            {children.length ?
                <div style={{maxHeight: '400px', maxWidth: '180px', overflowY: 'auto'}}>
                    {children}
                </div> : noElementsComponent }
        </NavDropdown>
    );
}