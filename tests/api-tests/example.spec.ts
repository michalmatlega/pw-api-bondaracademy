import { test } from '@playwright/test';
import { expect } from '../../utils/custom-expect';
import dotenv from 'dotenv';

const baseUrl = 'https://conduit-api.bondaracademy.com';

let authToken: string;

test.beforeAll('run before all', async({request}) => {
  const tokenResponse = await request.post(`${baseUrl}/api/users/login`, {
    data: {
      "user":{"email":process.env.USER,"password":process.env.PASS}
    }
  });

  const tokenResponseJSON = await tokenResponse.json();
  await expect(tokenResponseJSON).shouldMatchSchema('users', 'POST_users_login');
  authToken = `Token ${tokenResponseJSON.user.token}`;
});

test.afterAll('run after all', async({}) => {

});

test('Get Test Tags', async ({ request }) => {
  const tagsResponse = await request.get(`${baseUrl}/api/tags`);
  const tagsResponseJSON = await tagsResponse.json();

  await expect(tagsResponseJSON).shouldMatchSchema('tags', 'GET_tags');
  expect(tagsResponse.status()).toEqual(200);
  expect(tagsResponseJSON.tags[0]).toEqual('Test');
  expect(tagsResponseJSON.tags.length).toBeLessThanOrEqual(10);
});

test('Get All Articles', async ({ request }) => {
  const articlesResponse = await request.get(`${baseUrl}/api/articles?limit=2&offset=0`);
  const articlesResponseJSON = await articlesResponse.json();

  await expect(articlesResponseJSON).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponse.status()).toEqual(200);
  expect(articlesResponseJSON.articles.length).toBeLessThanOrEqual(10);
  expect(articlesResponseJSON.articlesCount).toEqual(10);
});

test('Create and delete Article', async ({ request }) => {

  const expectedTitle = 'This is title THREE';

  const newArticleResponse = await request.post(`${baseUrl}/api/articles`, {
    data: {
      "article": {
        "title": expectedTitle,
        "description": "This is about",
        "body": "This is description",
        "tagList": []
      }
    },
    headers: {
      'Authorization': authToken,
    },
  });
  const newArticleResponseJSON = await newArticleResponse.json();
  await expect(newArticleResponseJSON).shouldMatchSchema('articles', 'POST_articles');
  expect(newArticleResponse.status()).toEqual(201);
  expect(newArticleResponseJSON.article.title).toEqual(expectedTitle);

  const articleSlug = newArticleResponseJSON.article.slug;

  const articlesResponse = await request.get(`${baseUrl}/api/articles?limit=10&offset=0`, {headers: {
      'Authorization': authToken,
    }});
  const articlesResponseJSON = await articlesResponse.json();
  await expect(articlesResponseJSON).shouldMatchSchema('articles', 'GET_articles');
  expect(articlesResponse.status()).toEqual(200);
  expect(articlesResponseJSON.articles[0].title).toEqual(expectedTitle);

  const deleteArticleResponse = await request.delete(`${baseUrl}/api/articles/${articleSlug}`,{headers: {
      'Authorization': authToken,
    }});

  expect(deleteArticleResponse.status()).toEqual(204);

});

test('Create, update and delete Article', async ({ request }) => {
  const expectedTitle = 'This is title FOUR';

  const newArticleResponse = await request.post(`${baseUrl}/api/articles`, {
    data: {
      "article": {
        "title": expectedTitle,
        "description": "This is about",
        "body": "This is description",
        "tagList": []
      }
    },
    headers: {
      'Authorization': authToken,
    },
  });
  const newArticleResponseJSON = await newArticleResponse.json();
  await expect(newArticleResponseJSON).shouldMatchSchema('articles', 'POST_articles');
  expect(newArticleResponse.status()).toEqual(201);
  expect(newArticleResponseJSON.article.title).toEqual(expectedTitle);

  const articleSlug = newArticleResponseJSON.article.slug;

  const expectedModifiedTitle = 'This is title FOUR MODIFIED';

  const updateArticleResponse = await request.put(`${baseUrl}/api/articles/${articleSlug}`,{
    data: {
      "article": {
        "title": expectedModifiedTitle,
      }
    },
    headers: {
      'Authorization': authToken,
    }
  })

  let updateArticleResponseJSON = await updateArticleResponse.json();
  await expect(updateArticleResponseJSON).shouldMatchSchema('articles', 'PUT_articles');
  const modifiedArticleSlug = updateArticleResponseJSON.article.slug;

  expect(updateArticleResponse.status()).toEqual(200);

  const articlesResponse = await request.get(`${baseUrl}/api/articles?limit=10&offset=0`, {headers: {
      'Authorization': authToken,
    }});
  const articlesResponseJSON = await articlesResponse.json();
  await expect(articlesResponseJSON).shouldMatchSchema('articles', 'GET_articles');

  const deleteArticleResponse = await request.delete(`${baseUrl}/api/articles/${modifiedArticleSlug}`,{headers: {
      'Authorization': authToken,
    }});

  expect(deleteArticleResponse.status()).toEqual(204);

});

