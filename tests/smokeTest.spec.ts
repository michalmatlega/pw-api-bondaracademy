import {test} from "@playwright/test";
import {RequestHandler} from "../utils/request-handler";

const baseUrl = 'https://conduit-api.bondaracademy.com/api';

test('first test tag', async (request) => {
    const api = new RequestHandler();

    api
        .url(`${baseUrl}/api`)
        .path('/articles')
        .params({limit: 10, offset: 0})
        .headers({Authorization: 'authToken'})
        .body({"user":{"email":process.env.USER,"password":process.env.PASS}})
});
