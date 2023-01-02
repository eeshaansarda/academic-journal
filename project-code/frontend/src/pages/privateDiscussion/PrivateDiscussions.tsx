import {PrivateDiscussionIcon} from "@components/icon/Icons";
import {Col, Container, Row} from "react-bootstrap";
import {PrivateDiscussionService} from "@services/privateDiscussion/privateDiscussionService";
import {useContext, useEffect, useState} from "react";
import useStateRef from "react-usestateref";
import {PrivateDiscussions} from "@responses/privateDiscussion";
import PrivateDiscussionsCard from "@pages/privateDiscussion/card/PrivateDiscussionsCard";
import PaginationButtons, {PageData} from "@components/pagination/PaginationButtons";
import CreatePrivateDiscussion from "@components/privateDiscussion/create/CreatePrivateDiscussion";
import { SocketContext } from "@config/SocketContext";
import { useSelector } from "react-redux";
import { selectUser } from "@slices/userSlice";

const MAX_SUBMISSIONS_PER_PAGE = 10;

export default function PrivateDiscussions() {
    const privateDiscussionService = new PrivateDiscussionService();
    const [pageData, setPageData, pageDataRef] = useStateRef<PageData>({ pageNumber: 1, numPages: 0 });
    const [privateDiscussions, setPrivateDiscussions, privateDiscussionsRef] = useStateRef<PrivateDiscussions[]>([]);
    const [numDiscussions, setNumDiscussions, numDiscussionsRef] = useStateRef(0);
    const user = useSelector(selectUser);
    const socket = useContext(SocketContext);

    /**
     * Loads in the list of private discussions for the current user.
     * @param pageNumber The page number the user is on.
     */
    function getPrivateDiscussions(pageNumber: number) {
        privateDiscussionService.getPrivateDiscussions(pageNumber).then(res => {
            if (res.data && res.data.status === "success") {
                setPageData({ pageNumber, numPages: Math.ceil(res.data.numDiscussions / MAX_SUBMISSIONS_PER_PAGE) });
                setPrivateDiscussions(res.data.discussions);
                setNumDiscussions(res.data.numDiscussions);
            }
        });
    }

    /**
     * Called on page load. Sets up event listeners for the current user
     * being added or removed from private discussions. Also loads in
     * the initial list of private discussions.
     */
    useEffect(() => {
        if (socket.connected) {
            socket.emit('join', {
                id: `privateDiscussions${user!.id}`
            });
        } else {
            socket.on('connect', () => {
                socket.emit('join', {
                    id: `privateDiscussions${user!.id}`
                });
            })
        }

        socket.on('newDiscussion', discussion => {
            // only add if it will come into view in the current page
            if (privateDiscussionsRef.current.length < MAX_SUBMISSIONS_PER_PAGE) {
                setPrivateDiscussions([...privateDiscussionsRef.current, discussion]);
            }

            const newNumDiscussions = numDiscussionsRef.current + 1;
            setNumDiscussions(newNumDiscussions);
            setPageData({ pageNumber: pageDataRef.current.pageNumber, numPages: Math.ceil(newNumDiscussions / MAX_SUBMISSIONS_PER_PAGE) });
        });

        socket.on('discussionRemoved', details => {
            const index = privateDiscussionsRef.current.findIndex(d => d.id == details.id);
            if (index >= 0) {
                setPrivateDiscussions([
                    ...privateDiscussionsRef.current.slice(0, index),
                    ...privateDiscussionsRef.current.slice(index + 1)
                ]);
            }

            const newNumDiscussions = numDiscussionsRef.current - 1;
            setNumDiscussions(newNumDiscussions);

            // determine if we need to move back a page
            const numPages = Math.ceil(newNumDiscussions / MAX_SUBMISSIONS_PER_PAGE);
            const shouldMovePage = pageDataRef.current.pageNumber > numPages;
            const pageNumber = shouldMovePage
                ? pageDataRef.current.pageNumber - 1
                : pageDataRef.current.pageNumber;
            setPageData({ pageNumber, numPages });
            if (shouldMovePage) {
                getPrivateDiscussions(pageNumber);
            }
        });

        getPrivateDiscussions(1);
    }, []);


    return (<Container>
            <Row>
                <Col>
                    <h2><PrivateDiscussionIcon />Private Discussions</h2>
                </Col>
                <Col>
                    <div className="float-end">
                        <CreatePrivateDiscussion />
                    </div>
                </Col>
            </Row>
            <hr />

            <div>
                {privateDiscussions.map(discussion => <PrivateDiscussionsCard
                    key={discussion.id}
                    id={discussion.id}
                    host={discussion.host}
                    users={discussion.users} />)}

                <div className="justify-content-center d-flex mt-2">
                    {pageData.numPages > 1 ? <PaginationButtons pageData={pageData} pageChanged={getPrivateDiscussions} /> : null}
                </div>
            </div>
        </Container>);
}
