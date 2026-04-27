export type MockResponse = {
    statusCode?: number;
    body?: unknown;
    sent?: unknown;
    status: (code: number) => MockResponse;
    json: (body: unknown) => MockResponse;
    send: (body?: unknown) => MockResponse;
};

export const createMockResponse = (): MockResponse => {
    const response: MockResponse = {
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(body: unknown) {
            this.body = body;
            return this;
        },
        send(body?: unknown) {
            this.sent = body;
            return this;
        },
    };

    return response;
};
