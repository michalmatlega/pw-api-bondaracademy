import { test as base } from '@playwright/test';
import {RequestHandler} from "./request-handler";
import {APILogger} from "./logger";
import {setCustomExpectLogger} from "./custom-expect";
import {config} from '../api-test.config';

export type TestOptions = {
    api: RequestHandler;
    config: typeof config;
}

export const test = base.extend<TestOptions>({
    api: async ({request}, use) => {
        let logger = new APILogger();
        setCustomExpectLogger(logger);
        await use(
            new RequestHandler(
                request,
                'https://conduit-api.bondaracademy.com/api',
                logger
            )
        );
    },
    config: async ({}, use) => {
        await use(config)
    }
})
