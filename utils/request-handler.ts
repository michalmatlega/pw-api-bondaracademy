import {APIRequestContext} from "@playwright/test";
import {APILogger} from "./logger";

export class RequestHandler {

    private request: APIRequestContext;
    private logger: APILogger;
    private baseUrl: string;
    private defaultBaseUrl: string;
    private apiPath: string = '';
    private queryParams: object = {};
    private apiHeaders: Record<string, string> = {};
    private apiBody: object = {};

    constructor(request: APIRequestContext, apiBaseUrl: string, logger: APILogger) {
        this.request = request;
        this.defaultBaseUrl = apiBaseUrl;
        this.logger = logger;
    }

    url(url: string): this {
        this.baseUrl = url;
        return this;
    }

    path(path: string): this {
        this.apiPath = path;
        return this;
    }

    params(params: object) {
        this.queryParams = params;
        return this;
    }

    headers(headers: Record<string, string>) {
        this.apiHeaders = headers;
        return this;
    }

    body(body: object) {
        this.apiBody = body;
        return this;
    }

    async getRequest(statusCode: number = 200) {
        const url = this.getUrl();
        this.logger.logRequest('GET', url, this.apiHeaders);
        const response = await this.request.get(url, {
            headers: this.apiHeaders,
        })
        const actualStatus = response.status();
        const responseJSON = response.json();
        this.logger.logResponse(actualStatus, responseJSON);
        this.statusCodeValidator(actualStatus, statusCode, this.getRequest)
        return await responseJSON;
    }

    async postRequest(statusCode: number = 200) {
        const url = this.getUrl();
        this.logger.logRequest('POST', url, this.apiHeaders, this.apiBody);

        const response = await this.request.post(url, {
            headers: this.apiHeaders,
            data: this.apiBody,
        })
        const actualStatus = response.status();
        const responseJSON = response.json();
        this.logger.logResponse(actualStatus, responseJSON);

        this.statusCodeValidator(actualStatus, statusCode, this.postRequest)

        return await responseJSON;
    }

    async putRequest(statusCode: number = 200) {
        const url = this.getUrl();
        this.logger.logRequest('PUT', url, this.apiHeaders, this.apiBody);

        const response = await this.request.put(url, {
            headers: this.apiHeaders,
            data: this.apiBody,
        })

        const actualStatus = response.status();
        const responseJSON = response.json();
        this.logger.logResponse(actualStatus, responseJSON);

        this.statusCodeValidator(actualStatus, statusCode, this.putRequest)

        return await responseJSON;
    }

    async deleteRequest(statusCode: number = 200) {
        const url = this.getUrl();
        this.logger.logRequest('DELETE', url, this.apiHeaders);

        const response = await this.request.delete(url, {
            headers: this.apiHeaders,
        })
        const actualStatus = response.status();
        this.logger.logResponse(actualStatus);

        this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest)

    }

    private getUrl() {
        const url = new URL(`${this.baseUrl ?? this.defaultBaseUrl}/${this.apiPath}`);
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value);
        }
        return url.toString();
    }

    private statusCodeValidator(actualStatus: number, expectedStatus: number, callingMethod: Function) {
        if(actualStatus === expectedStatus) return;
        const logs = this.logger.getRecentLogs();
        const error = new Error(`Expected status ${expectedStatus} but got ${actualStatus} \n\nRecent API Activity: \n${logs}`)
        Error.captureStackTrace(error, callingMethod);
        throw error;
    }

}
