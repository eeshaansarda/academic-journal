import { UserService } from '@services/user/userService';
import { useEffect, useState } from 'react';
import {Col, Container, Row, Image, Button} from 'react-bootstrap';
import {useHistory, useParams} from 'react-router-dom';
import { defaultProfileLink, userProfilePictureEndpoint } from '@root/config';
import {profilePath, resourceNotFound} from "@config/paths";
import {EditIcon, EmailIcon, FacebookIcon, InstitutionIcon, LinkedInIcon, TwitterIcon} from "@components/icon/Icons";
import UserSubmissions from "@components/profile/submissions/UserSubmissions";
import UserPublications from "@components/profile/publications/UserPublications";
import UserRestricted from "@components/roleRestricted/UserRestricted";
import UsersRolePill from "@components/user/role/UserRolePill";
import {UserRole} from "@role/role";
import SsoTag from "@components/user/tag/SsoTag";

interface ProfileParams {
    userId: string;
}

interface Profile {
    username: string;
    team: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    institution: string | null;
    biography: string | null;
    twitter: string | null;
    facebook: string | null;
    linkedIn: string | null;
    role: UserRole;
}

export default function UserProfile() {
    const [ profile, setProfile ] = useState<Profile | null>(null);
    const { userId } = useParams<ProfileParams>();
    const userService = new UserService();
    const history = useHistory();

    useEffect(() => {
        userService.getPublicProfile(userId)
            .then(res => {
                if (res.data.status && res.data.status == 'success') {
                    setProfile(res.data.details);
                }
            })
            .catch(_ => history.replace(resourceNotFound));
    }, [userId]);

    const UserFullName = () => {
        if (!profile?.firstName && !profile?.lastName)
            return null;

        if (profile.firstName && profile.lastName)
            return <span>({profile.firstName} {profile.lastName})</span>;

        if (profile.firstName)
            return <span>({profile.firstName})</span>

        return <span>({profile.lastName})</span>;
    }

    return (
        <Container>
            {!profile
                ? <h1>User does not exist</h1>
                : <Container>
                    <Row>
                        <Col>
                            <UserRestricted userId={userId}>
                                <Button
                                    className="float-end"
                                    variant="warning"
                                    onClick={() => history.push(profilePath)}>
                                        <EditIcon />
                                </Button>
                            </UserRestricted>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col className="d-flex justify-content-center">
                            <div className="profile-picture-container">
                                <Image 
                                    id="profilePicture"
                                    className="border border-dark" 
                                    height={150}
                                    width={150}
                                    src={`${userProfilePictureEndpoint}?userId=${userId}&r=${Math.floor(Math.random() * 1000)}`}
                                    tabIndex={-1}
                                    roundedCircle
                                    onError={e => (e.target as HTMLImageElement).src = defaultProfileLink}
                                />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex justify-content-center">
                            <UsersRolePill role={profile.role} />
                            <SsoTag team={profile.team} />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="d-flex justify-content-center">
                            {`${profile.username} `} <span>&nbsp;</span>  <UserFullName />
                        </Col>
                    </Row>


                    {profile.biography
                        ? <Row className="mb-2">
                            <Col className="justify-content-center d-flex">
                                <div dangerouslySetInnerHTML={{__html: profile.biography}} />
                            </Col>
                        </Row>
                        : <p className="text-muted text-center mt-2">This user has not provided a biography</p>
                    }

                    <Row>
                        <Col className="justify-content-center">
                            <Row>
                                {profile.institution ?
                                    <Col className="text-center">
                                        <InstitutionIcon /> {profile.institution}
                                    </Col> : null }
                                {profile.email ?
                                    <Col className="text-center">
                                        <EmailIcon /> <a href={`mailto: ${profile.email}`}>{profile.email}</a>
                                    </Col> : null }
                            </Row>

                        </Col>
                    </Row>

                    <Row className="mt-3">
                        <Row className="justify-content-center">
                            <Col xs="auto">
                                {profile.twitter 
                                    ? <div 
                                        style={{ width: 20, height: 20 }}
                                        onClick={() => document.location.href = profile.twitter as string}>
                                            <TwitterIcon size="2x"/>
                                        </div>
                                    : <div/>
                                }
                            </Col>

                            <Col xs="auto">
                                {profile.facebook 
                                    ? <div 
                                        style={{ width: 20, height: 20 }}
                                        onClick={() => document.location.href = profile.facebook as string}>
                                            <FacebookIcon size="2x"/>
                                        </div>
                                    : <div/>
                                }
                            </Col>

                            <Col xs="auto">
                                {profile.linkedIn 
                                    ? <div 
                                        style={{ width: 20, height: 20 }}
                                        onClick={() => document.location.href = profile.linkedIn as string}>
                                            <LinkedInIcon size="2x"/>
                                        </div>
                                    : <div/>
                                }
                            </Col>
                        </Row>
                    </Row>

                    <Row className="mt-5">
                        <Col>
                            <UserSubmissions userId={userId} />
                        </Col>
                        <Col>
                            <UserPublications userId={userId} />
                        </Col>
                    </Row>
                </Container>
            }
        </Container>
    );
}