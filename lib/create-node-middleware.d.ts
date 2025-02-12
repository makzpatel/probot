/// <reference types="node" />
import { RequestListener } from "http";
import { ApplicationFunction } from "./types";
import { MiddlewareOptions } from "./types";
export declare function createNodeMiddleware(appFn: ApplicationFunction, { probot, webhooksPath }: MiddlewareOptions): RequestListener;
