import express, { Router } from "express";
import { AddressInfo } from "node:net";
import { Server } from "node:http";

type RequestOptions = {
    body?: unknown;
    headers?: Record<string, string>;
    rawBody?: string | Uint8Array;
};

export type TestApi = {
    request: (method: string, path: string, options?: RequestOptions) => Promise<{
        status: number;
        body: any;
        text: string;
        headers: Headers;
    }>;
    close: () => Promise<void>;
};

export const createTestApi = async (router: Router, basePath = "/api"): Promise<TestApi> => {
    const app = express();
    app.use(express.json());
    app.use(basePath, router);

    const server = await new Promise<Server>((resolve) => {
        const listeningServer = app.listen(0, () => resolve(listeningServer));
    });

    const { port } = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${port}${basePath}`;

    return {
        async request(method, path, options = {}) {
            const headers = new Headers(options.headers);
            const init: RequestInit = { method, headers };

            if (options.rawBody !== undefined) {
                init.body = options.rawBody as BodyInit;
            } else if (options.body !== undefined) {
                headers.set("content-type", "application/json");
                init.body = JSON.stringify(options.body);
            }

            const response = await fetch(`${baseUrl}${path}`, init);
            const text = await response.text();

            let body: any = undefined;
            if (text) {
                try {
                    body = JSON.parse(text);
                } catch {
                    body = text;
                }
            }

            return {
                status: response.status,
                body,
                text,
                headers: response.headers,
            };
        },
        close() {
            return new Promise<void>((resolve, reject) => {
                server.close((error) => error ? reject(error) : resolve());
            });
        },
    };
};
