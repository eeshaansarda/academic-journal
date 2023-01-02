import {ErrorIcon, PublicationOfTheDayIcon} from "@components/icon/Icons";
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import {Submission} from "@responses/submission";
import {PublicationService} from "@services/publication/publicationService";
import {truncate} from "lodash";
import {removeTags} from "@root/utilities/sanitize/sanitizeHtml";
import * as paths from "@config/paths";

const DESCRIPTION_LENGTH = 50;

/**
 * Represents the most visited publication in the current day
 */
export default function SubmissionsOfTheDay() {
    const [submissionOfTheDay, setSubmissionOfTheDay] = useState<Submission | null>();
    const publicationService = new PublicationService();

    useEffect(() => {
        publicationService.getSubmissionOfTheDay().then(res => {
            if (res.data && res.data.status === "success")
                setSubmissionOfTheDay(res.data.publication);
        });
    }, []);

    if (!submissionOfTheDay)
        return (<div className="p-5 border text-center">
            <h3><ErrorIcon /></h3>
            We were unable to get the submission of the day at this time.
        </div>);


    return (
        <div className="p-5 border">
            <h3><PublicationOfTheDayIcon  /></h3>
            <h1>Publication Of The Day</h1>


            <h4 className="mt-4">{submissionOfTheDay?.title}</h4>
            <p>{truncate(removeTags(submissionOfTheDay.description), { length: DESCRIPTION_LENGTH })}</p>

            <Link to={`${paths.publicationPath}/${submissionOfTheDay.submissionId}`}>Read here</Link>
        </div>
    );
}