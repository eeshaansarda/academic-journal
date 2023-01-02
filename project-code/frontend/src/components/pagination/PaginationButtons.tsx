import React, { SyntheticEvent } from 'react';
import { Pagination } from 'react-bootstrap';

/**
 * @property pageNumber the initial pageNumber being selected
 * @property numPages the number of pages within the list
 */
export interface PageData {
    pageNumber: number;
    numPages: number;
}

/**
 * @property pageData
 */
interface PaginationProperties {
    pageData: PageData;
    pageChanged: (pageNumber: number) => void;
}

/**
 * Component that represents a set of pages within a list.
 * Used to only fetch part of a list at anyone time.
 */
class PaginationButtons extends React.Component<PaginationProperties, {}> {

    /**
     * Updates the page number when a specific page button is clicked.
     * @param e The click event.
     */
    private async pageButtonClicked(e: SyntheticEvent) {
        const pageNumber = parseInt((e.target as any).innerText);
        if (!isNaN(pageNumber)) {
            this.props.pageChanged(pageNumber);
        }
    }

    /**
     * Shifts the page number by a set amount.
     * @param amount The amount.
     */
    private async shiftPageNumber(amount: number) {
        let pageNumber = this.props.pageData.pageNumber + amount;
        pageNumber = Math.max(pageNumber, 1);
        pageNumber = Math.min(pageNumber, this.props.pageData.numPages);
        this.props.pageChanged(pageNumber);
    }

    /**
     * Returns a list of pagination components for the contents of 
     * the pages area.
     * @param pageNumber The current page number.
     * @param numPages The total number of pages.
     * @returns The list of pagination components.
     */
    private getPageItems(pageNumber: number, numPages: number): any[] {
        const pages = [1];

        if (pageNumber - 1 > 1) { // add previous page
            pages.push(pageNumber - 1);
        }

        if (pageNumber !== 1) { // add current page
            pages.push(pageNumber);
        }
        if (pageNumber + 1 < numPages) { // add next page
            pages.push(pageNumber + 1);
        }

        if (numPages !== 1 && numPages !== pageNumber) { // add last page
            pages.push(numPages);
        }

        const pageItems = [];
        let lastPage = 1;
        for (const page of pages) {
            if (page - lastPage > 1) {
                pageItems.push(<Pagination.Ellipsis key={`${page - 1}...${page}`}/>);
            }
            pageItems.push(<Pagination.Item key={page} active={pageNumber === page} onClick={this.pageButtonClicked.bind(this)}>{page}</Pagination.Item>);
            lastPage = page;
        }

        return pageItems;
    }

    /**
     * Renders the component.
     */
    render() {
        if (this.props.pageData.numPages === 0)
            return null;

        const pageItems = this.getPageItems(this.props.pageData.pageNumber, this.props.pageData.numPages);

        return (
            <Pagination>
                <Pagination.Prev data-testid="prev" disabled={this.props.pageData.pageNumber === 1} onClick={() => this.shiftPageNumber(-1)}/>
                {pageItems}
                <Pagination.Next data-testid="next" disabled={this.props.pageData.pageNumber === this.props.pageData.numPages} onClick={() => this.shiftPageNumber(+1)}/>
            </Pagination>
        );
    }
}

export default PaginationButtons;