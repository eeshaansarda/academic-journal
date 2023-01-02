import {Announcement} from "@responses/announcement";
import faker from "@faker-js/faker";
import {v4} from "uuid";


export default function generateMockAnnouncement(): Announcement {
    return {
        id: v4(),
        content: faker.random.words(),
        title: faker.random.word(),
        author: { id: v4(), username: faker.internet.userName() },
        published: new Date().valueOf()
    }
}