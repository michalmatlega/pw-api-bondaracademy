import { RequestHandler } from '../utils/request-handler'
import {config} from "../api-test.config";
import {request} from "@playwright/test";
import {APILogger} from "../utils/logger";

export async function createToken(email: string, password: string): Promise<string> {
    const context = await request.newContext();
    let logger = new APILogger();
    let api = new RequestHandler(
        context,
        config.apiUrl,
        logger
    )
    try {
        const tokenResponse = await api
            .path('/users/login')
            .body({"user": { "email": email, "password": password }})
            .postRequest(200);
        return `Token ${tokenResponse.user.token}`;
    } catch(error) {
        Error.captureStackTrace(error, createToken)
        throw error;
    } finally {
        await context.dispose();
    }

}
