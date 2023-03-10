import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faBook, faStar} from "@fortawesome/free-solid-svg-icons";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {faChartPie} from "@fortawesome/free-solid-svg-icons";
import {faCheck} from "@fortawesome/free-solid-svg-icons";
import {faToolbox} from "@fortawesome/free-solid-svg-icons";
import {faComment, faEnvelope} from "@fortawesome/free-solid-svg-icons";
import {faClock} from "@fortawesome/free-solid-svg-icons";
import {faCalendar} from "@fortawesome/free-solid-svg-icons";
import {faFire} from "@fortawesome/free-solid-svg-icons";
import {faSearch} from "@fortawesome/free-solid-svg-icons";
import {faDownload} from "@fortawesome/free-solid-svg-icons";
import {faExclamation} from "@fortawesome/free-solid-svg-icons";
import {faBullhorn} from "@fortawesome/free-solid-svg-icons";
import {faUserSecret} from "@fortawesome/free-solid-svg-icons";
import {faFile} from "@fortawesome/free-solid-svg-icons";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {faBinoculars} from "@fortawesome/free-solid-svg-icons";
import {faBell} from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle} from "@fortawesome/free-solid-svg-icons";
import {faComments} from "@fortawesome/free-solid-svg-icons";
import {faSmile} from "@fortawesome/free-solid-svg-icons";
import {faList} from "@fortawesome/free-solid-svg-icons";
import {faBan} from "@fortawesome/free-solid-svg-icons";
import {faGithub} from "@fortawesome/free-brands-svg-icons";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {faBuilding} from "@fortawesome/free-solid-svg-icons";
import {faEnvelopeOpen} from "@fortawesome/free-solid-svg-icons";
import {faPencilAlt} from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import {faTwitter, faFacebook, faLinkedin} from "@fortawesome/free-brands-svg-icons";
import { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {faPalette} from "@fortawesome/free-solid-svg-icons";

export const SubmissionIcon = () => <FontAwesomeIcon icon={faBook} />;
export const BlueSubmissionIcon = () => <FontAwesomeIcon color='#4f92ff' icon={faBook} />;
export const UserIcon = () => <FontAwesomeIcon icon={faUser} />;
export const DashboardIcon = () => <FontAwesomeIcon icon={faChartPie} />;
export const PublishedSubmissionsIcon = () => <FontAwesomeIcon icon={faCheck} />;
export const AdminIcon = () => <FontAwesomeIcon icon={faToolbox} />;
export const ReviewIcon = () => <FontAwesomeIcon icon={faComment} />;
export const BlueReviewIcon = () => <FontAwesomeIcon color='#4f92ff' icon={faComment} />;
export const EnvelopeIcon = () => <FontAwesomeIcon icon={faEnvelope} />;
export const ClockIcon = () => <FontAwesomeIcon icon={faClock} />;
export const PublicationOfTheDayIcon = () => <FontAwesomeIcon icon={faCalendar} />;
export const TrendingSubmissionsIcon = () => <FontAwesomeIcon icon={faFire} />;
export const SearchIcon = () => <FontAwesomeIcon icon={faSearch} />;
export const DownloadIcon = () => <FontAwesomeIcon icon={faDownload} />;
export const ErrorIcon = ({ size }: IconProps) => <FontAwesomeIcon size={size} icon={faExclamation} />;
export const PublicIcon = () => <FontAwesomeIcon icon={faBullhorn} />;
export const PrivateIcon = () => <FontAwesomeIcon icon={faUserSecret} />;
export const SupportingDocumentIcon = () => <FontAwesomeIcon icon={faFile} />;
export const AddIcon = () => <FontAwesomeIcon icon={faPlusCircle} />;
export const NotFoundIcon = () => <FontAwesomeIcon icon={faBinoculars} />;
export const NotificationIcon = () => <FontAwesomeIcon icon={faBell} />;
export const PublishedIcon = () => <FontAwesomeIcon icon={faCheckCircle} />;
export const FeaturedIcon = () => <FontAwesomeIcon icon={faStar} />;
export const BluePublishedIcon = () => <FontAwesomeIcon color='#4f92ff' icon={faCheckCircle} />;
export const AnnouncementIcon = () => <FontAwesomeIcon icon={faBullhorn} />;
export const MetadataIcon = () => <FontAwesomeIcon icon={faBars} />;
export const PrivateDiscussionIcon = () => <FontAwesomeIcon icon={faComments} />;
export const SuccessIcon = () => <FontAwesomeIcon icon={faSmile} />;
export const ToDoIcon = () => <FontAwesomeIcon icon={faList} />;
export const BanIcon = () => <FontAwesomeIcon icon={faBan} />;
export const GitHubIcon = () => <FontAwesomeIcon icon={faGithub as any} />;
export const BackIcon = () => <FontAwesomeIcon icon={faArrowLeft} />;
export const InstitutionIcon = () => <FontAwesomeIcon icon={faBuilding} />;
export const EmailIcon = () => <FontAwesomeIcon icon={faEnvelopeOpen} />;
export const EditIcon = () => <FontAwesomeIcon icon={faPencilAlt} />;
export const ReportIcon = () => <FontAwesomeIcon icon={faExclamation} />;
export const InfoIcon = () => <FontAwesomeIcon icon={faInfoCircle} />;
export const BlueInfoIcon = () => <FontAwesomeIcon color='#4f92ff' icon={faInfoCircle} />;
export const LinkIcon = () => <FontAwesomeIcon icon={faLink} />;
export const SeenIcon = () => <FontAwesomeIcon icon={faCheckDouble} />;
export const DeleteIcon = () => <FontAwesomeIcon icon={faTrash} />;
export const ThemeIcon = () => <FontAwesomeIcon icon={faPalette} />;

interface IconProps {
    size?: SizeProp
}

export const TwitterIcon = ({ size }: IconProps) => <FontAwesomeIcon icon={faTwitter as IconProp} size={size as any} />;
export const FacebookIcon = ({ size }: IconProps) => <FontAwesomeIcon icon={faFacebook as IconProp} size={size} />;
export const LinkedInIcon = ({ size }: IconProps) => <FontAwesomeIcon icon={faLinkedin as IconProp} size={size} />;