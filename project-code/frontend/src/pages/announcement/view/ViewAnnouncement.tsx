import {useParams} from "react-router-dom";
import {Container} from "react-bootstrap";
import {AnnouncementService} from "@services/announcement/announcementService";
import {useEffect, useState} from "react";
import {Announcement} from "@responses/announcement";
import {AnnouncementIcon} from "@components/icon/Icons";
import ProfileLink from "@components/profile/ProfileLink";
import moment from "moment";

interface AnnouncementParams {
    announcementId: string;
}

export default function ViewAnnouncement() {
    const params = useParams<AnnouncementParams>();
    const announcementService = new AnnouncementService();
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    function getAnnouncement() {
        announcementService.getAnnouncement(params.announcementId).then(res => {
            if (res.data && res.data.status === "success")
                setAnnouncement(res.data.announcement);
        });
    }

    useEffect(() => {
        getAnnouncement();
    }, [params.announcementId]);

    if (!announcement)
        return null;

    return (
        <Container>
            <h2>
                <AnnouncementIcon /> {announcement.title}
            </h2>
            <hr />

            <div className="m-3" dangerouslySetInnerHTML={{__html: announcement.content}} />

            <div className="m-3 text-muted">
                <ProfileLink userId={announcement.author.id} username={announcement.author.username} />
                {moment(announcement.published).format("DD/MM/YYYY")}
            </div>
        </Container>);
}