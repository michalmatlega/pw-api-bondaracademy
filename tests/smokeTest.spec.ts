import { test } from "../utils/fixtures";
import {expect} from "../utils/custom-expect";

let authToken: string;

test.beforeAll('run before all', async({ api, config }) => {
    // const tokenResponse = await request.post(`${baseUrl}/api/users/login`, {
    //     data: {
    //         "user":{"email":process.env.USER,"password":process.env.PASS}
    //     }
    // });

    const tokenResponse = await api.path('/users/login').body({'user': {"email": config.userEmail,"password": config.userPassword}}).postRequest();

    authToken = `Token ${tokenResponse.user.token}`;
});

test('Get Articles', async ({ api }) => {
    // const response = await api
    //     .path('/articles')
    //     .params({limit: 10, offset: 0, foo: 'bar'})
    //     .headers({Authorization: 'authToken'})
    //     .body({"user":{"email":process.env.USER,"password":process.env.PASS}}).getRequest();

    const response = await api
        .path('/articles')
        .params({limit: 10, offset: 0, foo: 'bar'})
        .getRequest();

    expect(response.articles.length).shouldBeLessThanOrEqual(10);
    expect(response.articlesCount).shouldEqual(10);
});

test('Get Test Tags', async ({ api }) => {
    const response= await api
        .path('tags')
        .getRequest();
    expect(response.tags[0]).shouldEqual('Test');
    expect(response.tags.length).shouldEqual(10);
})

test('Create and delete Articles', async ({ api }) => {
    const expectedTitle = 'This is title THREE';
    const createArticleResponse = await api
        .path('articles')
        .headers({Authorization: authToken})
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
        .headers({Authorization: authToken})
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponse.articles[0].title).shouldEqual(expectedTitle);

    await api
        .path(`articles/${slugId}`)
        .headers({Authorization: authToken})
        .deleteRequest(204);

    const articlesResponseAfterDelete = await api
        .path('articles')
        .headers({Authorization: authToken})
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual(expectedTitle);

})

test('Create, update and delete Articles', async ({ api }) => {
    const expectedTitle = 'This is title THREE';
    const createArticleResponse = await api
        .path('articles')
        .headers({Authorization: authToken})
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
        .headers({Authorization: authToken})
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponse.articles[0].title).shouldEqual(expectedTitle);

    let expectedUpdatedTitle = 'This is title THREE updated';

    const updateResponse = await api
        .path(`articles/${slugId}`)
        .headers({Authorization: authToken})
        .body({
            "article": {
                "title": expectedUpdatedTitle,
                "description": "This is about",
                "body": "This is description",
                "tagList": []
            }
        })
        .putRequest();

    const updatedSlugId = updateResponse.article.slug;

    const articlesAfterUpdateResponse = await api
        .path('articles')
        .headers({Authorization: authToken})
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesAfterUpdateResponse.articles[0].title).shouldEqual(expectedUpdatedTitle);

    await api
        .path(`articles/${updatedSlugId}`)
        .headers({Authorization: authToken})
        .deleteRequest(204);

    const articlesResponseAfterDelete = await api
        .path('articles')
        .headers({Authorization: authToken})
        .params({limit: 10, offset: 0})
        .getRequest();
    expect(articlesResponseAfterDelete.articles[0].title).not.shouldEqual(expectedTitle);

})
