import { test } from "../../utils/fixtures";
import { expect } from "../../utils/custom-expect";
import { validateSchema } from "../../utils/schema-validator";
import { faker } from '@faker-js/faker';
// @ts-ignore
import articleRequestPayload from '../../request-objects/POST-article.json';
import {getNewRandomArticle} from "../../utils/data-generator";

const titleToSlugFormat = (title: string): string => {
    return title
        .replace(/\s+/g, '-')
        .replace(/,/g, '');  // Remove only commas, keep other punctuation
};

const escapeRegexSpecialChars = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

test('Get Articles', async ({ api }) => {
    const response = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    await expect(response).shouldMatchSchema('articles', 'GET_articles', true);

    expect(response.articles.length).shouldBeLessThanOrEqual(10);
    expect(response.articlesCount).shouldEqual(10);

    // Verify that each article's slug is derived from its title (format: title-with-hyphens-number)
    response.articles.forEach((article: any) => {
        const expectedSlugPrefix = titleToSlugFormat(article.title);
        const escapedSlugPrefix = escapeRegexSpecialChars(expectedSlugPrefix);
        const slugPattern = new RegExp(`^${escapedSlugPrefix}-\\d+$`);
        expect(article.slug).toMatch(slugPattern);
    });
});

test('Get Test Tags', async ({ api }) => {
    const response = await api
        .path('tags')
        .getRequest();
    await expect(response).shouldMatchSchema('tags', 'GET_tags', true);

    expect(response.tags[0]).shouldEqual('Test');
    expect(response.tags.length).shouldEqual(10);
})

test('Create and delete Articles', async ({ api }) => {
    const articleRequest = getNewRandomArticle();
    const expectedTitle = 'This is title THREE';
    const createArticleResponse = await api
        .path('articles')
        .body(articleRequest).postRequest(201);
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles', true);

    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title);
    const slugId = createArticleResponse.article.slug;

    const articlesResponse = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles', true);
    expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title);

    await api
        .path(`articles/${slugId}`)
        .deleteRequest(204);

    const articlesResponseAfterDelete = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    await expect(articlesResponseAfterDelete).shouldMatchSchema('articles', 'GET_articles', true);

    expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual(expectedTitle);

})

test('Create, update and delete Articles', async ({ api }) => {
    const articleRequest = getNewRandomArticle();
    const createArticleResponse = await api
        .path('articles')
        .body(articleRequest).postRequest(201);
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles', true);

    expect(createArticleResponse.article.title).shouldEqual(articleRequest.article.title);
    const slugId = createArticleResponse.article.slug;

    const articlesResponse = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    await expect(articlesResponse).shouldMatchSchema('articles', 'GET_articles', true);
    expect(articlesResponse.articles[0].title).shouldEqual(articleRequest.article.title);

    const articleRequestTwo = getNewRandomArticle();
    const updateResponse = await api
        .path(`articles/${slugId}`)
        .body(articleRequestTwo)
        .putRequest();
    await expect(updateResponse).shouldMatchSchema('articles', 'PUT_articles', true);

    const updatedSlugId = updateResponse.article.slug;

    const articlesAfterUpdateResponse = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    await expect(articlesAfterUpdateResponse).shouldMatchSchema('articles', 'GET_articles', true);
    expect(articlesAfterUpdateResponse.articles[0].title).shouldEqual(articleRequestTwo.article.title);

    await api
        .path(`articles/${updatedSlugId}`)
        .deleteRequest(204);

    const articlesResponseAfterDelete = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    await expect(articlesResponseAfterDelete).shouldMatchSchema('articles', 'GET_articles', true);
    expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual(articleRequestTwo.article.title);

})
