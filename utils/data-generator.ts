// @ts-ignore
import articleRequestPayload from '../request-objects/POST-article.json';
import {faker} from '@faker-js/faker';

export function getNewRandomArticle() {
    //const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload))
    const articleRequest = structuredClone(articleRequestPayload);
    articleRequest.article.title = faker.lorem.sentence(5);
    articleRequest.article.description = faker.lorem.sentence(3);
    articleRequest.article.body = faker.lorem.paragraph(8);

    return articleRequest;
}

