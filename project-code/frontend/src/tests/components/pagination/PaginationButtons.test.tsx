import {render} from "@testing-library/react";
import PaginationButtons, {PageData} from "@components/pagination/PaginationButtons";

describe ('Pagination Button Tests', () => {
    test ('when there are no pages the component does not display', async () => {
        const pageData: PageData = { pageNumber: 0, numPages: 0 };
        const { container } = render(<PaginationButtons pageData={pageData} pageChanged={() => undefined} />);
        expect(container.firstChild).toBeNull();
    });

    test ('when the next page number button is clicked the page number is incremented by 1', async () => {
        const pageData: PageData = { pageNumber: 1, numPages: 10 };
        const spy = jest.fn();

        const renderObj = render(<PaginationButtons pageData={pageData} pageChanged={spy} />);

        const element = renderObj.getByTestId('next');
        element.click();
        expect(spy).toHaveBeenCalledWith(2);
    });

    test ('when the previous page number button is clicked the page number is decremented by 1', async () => {
        const pageData: PageData = { pageNumber: 2, numPages: 10 };
        const spy = jest.fn();

        const renderObj = render(<PaginationButtons pageData={pageData} pageChanged={spy} />);

        const element = renderObj.getByTestId('prev');
        element.click();
        expect(spy).toHaveBeenCalledWith(1);
    });

    test ('we can never exceed the total number of pages', async () => {
        const pageData: PageData = { pageNumber: 10, numPages: 10 };
        const spy = jest.fn();

        const renderObj = render(<PaginationButtons pageData={pageData} pageChanged={spy} />);

        const element = renderObj.getByTestId('next');
        element.click();
        expect(spy).toHaveBeenCalledWith(10);
    });

    test ('when we are at the left most page the previous button is disabled', async () => {
        const pageData: PageData = { pageNumber: 1, numPages: 10 };
        const spy = jest.fn();

        const renderObj = render(<PaginationButtons pageData={pageData} pageChanged={spy} />);

        const element = renderObj.getByTestId('prev');
        element.click();
        expect(spy).toHaveBeenCalledWith(1);
    });
});