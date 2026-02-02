import { test } from "../../utils/fixtures";
import { expect } from "../../utils/custom-expect";
import { faker } from '@faker-js/faker';
// @ts-ignore
import postArticlePayload from '../../request-objects/POST-article.json';

test('HAR Flow - Create Article with Comments', async ({ api }) => {
    // Note: login request from HAR is skipped because auth is handled by fixtures

    // Step 3 - Create article (use faker for dynamic data)
    const articleRequest = structuredClone(postArticlePayload);
    articleRequest.article.title = faker.lorem.sentence(5);
    articleRequest.article.description = faker.lorem.sentence(8);
    articleRequest.article.body = faker.lorem.paragraphs(2);
    articleRequest.article.tagList = [faker.lorem.word()];

    const createArticleResponse = await api
        .path('articles')
        .body(articleRequest)
        .postRequest(201);
    await expect(createArticleResponse).shouldMatchSchema('articles', 'POST_articles', true);

    const articleSlug = createArticleResponse.article.slug;

    // Step 4 - Get created article by slug
    const getArticleResponse = await api
        .path(`articles/${articleSlug}`)
        .getRequest(200);
    await expect(getArticleResponse).shouldMatchSchema('articles', 'GET_articles', true);
    expect(getArticleResponse.article.slug).shouldEqual(articleSlug);

    // Step 5 - Get comments for the article
    const getCommentsResponse = await api
        .path(`articles/${articleSlug}/comments`)
        .getRequest(200);
    await expect(getCommentsResponse).shouldMatchSchema('articles', 'GET_articles_comments', true);

    // Step 6 - Post a comment
    const commentBody = { comment: { body: faker.lorem.sentence(8) } };
    const postCommentResponse = await api
        .path(`articles/${articleSlug}/comments`)
        .body(commentBody)
        .postRequest(200);
    await expect(postCommentResponse).shouldMatchSchema('articles', 'POST_articles_comments', true);

    const commentId = postCommentResponse.comment.id;
    expect(postCommentResponse.comment.body).shouldEqual(commentBody.comment.body);
});
