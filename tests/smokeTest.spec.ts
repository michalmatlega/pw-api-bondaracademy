import { test } from "../utils/fixtures";
import { expect } from "../utils/custom-expect";
import { validateSchema } from "../utils/schema-validator";

test('Get Articles', async ({ api }) => {
    const response = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();

    await validateSchema('articles', 'GET_articles', response);

    expect(response.articles.length).shouldBeLessThanOrEqual(10);
    expect(response.articlesCount).shouldEqual(10);
});

test('Get Test Tags', async ({ api }) => {
    const response= await api
        .path('tags')
        .getRequest();

    await expect(response).shouldMatchSchema('tags', 'GET_tags');

    expect(response.tags[0]).shouldEqual('Test');
    expect(response.tags.length).shouldEqual(10);
})

test('Create and delete Articles', async ({ api }) => {
    const expectedTitle = 'This is title THREE';
    const createArticleResponse = await api
        .path('articles')
        .body({
            "article": {
                "title": expectedTitle,
                "description": "This is about",
                "body": "This is description",
                "tagList": []
        }
    }).postRequest(201);

    await validateSchema('articles', 'POST_articles', createArticleResponse);

    expect(createArticleResponse.article.title).shouldEqual(expectedTitle);
    const slugId = createArticleResponse.article.slug;

    const articlesResponse = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponse.articles[0].title).shouldEqual(expectedTitle);

    await validateSchema('articles', 'GET_articles', articlesResponse);


    await api
        .path(`articles/${slugId}`)
        .deleteRequest(204);

    const articlesResponseAfterDelete = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();

    expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual(expectedTitle);

})

test('Create, update and delete Articles', async ({ api }) => {
    const expectedTitle = 'This is title THREE';
    const createArticleResponse = await api
        .path('articles')
        .body({
            "article": {
                "title": expectedTitle,
                "description": "This is about",
                "body": "This is description",
                "tagList": []
            }
        }).postRequest(201);

    expect(createArticleResponse.article.title).shouldEqual(expectedTitle);
    const slugId = createArticleResponse.article.slug;

    const articlesResponse = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponse.articles[0].title).shouldEqual(expectedTitle);


    let expectedUpdatedTitle = 'This is title THREE updated';

    const updateResponse = await api
        .path(`articles/${slugId}`)
        .body({
            "article": {
                "title": expectedUpdatedTitle,
                "description": "This is about",
                "body": "This is description",
                "tagList": []
            }
        })
        .putRequest();
    await validateSchema('articles', 'PUT_articles', updateResponse);

    const updatedSlugId = updateResponse.article.slug;

    const articlesAfterUpdateResponse = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesAfterUpdateResponse.articles[0].title).shouldEqual(expectedUpdatedTitle);

    await api
        .path(`articles/${updatedSlugId}`)
        .deleteRequest(204);

    const articlesResponseAfterDelete = await api
        .path('articles')
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual(expectedTitle);

})
