import LRUCache from "lru-cache";
import { ProbotOctokit } from "./probot-octokit";
import Redis from "ioredis";
import type { Logger } from "pino";
type Options = {
    cache: LRUCache<number, string>;
    Octokit: typeof ProbotOctokit;
    log: Logger;
    githubToken?: string;
    appId?: number;
    privateKey?: string;
    redisConfig?: Redis.RedisOptions | string;
    baseUrl?: string;
};
/**
 * Returns an Octokit instance with default settings for authentication. If
 * a `githubToken` is passed explicitly, the Octokit instance will be
 * pre-authenticated with that token when instantiated. Otherwise Octokit's
 * app authentication strategy is used, and `options.auth` options are merged
 * deeply when instantiated.
 *
 * Besides the authentication, the Octokit's baseUrl is set as well when run
 * against a GitHub Enterprise Server with a custom domain.
 */
export declare function getProbotOctokitWithDefaults(options: Options): typeof import("@octokit/core").Octokit & import("@octokit/core/dist-types/types").Constructor<{
    retry: {
        retryRequest: (error: import("@octokit/request-error").RequestError, retries: number, retryAfter: number) => import("@octokit/request-error").RequestError;
    };
} & {
    paginate: import("@octokit/plugin-paginate-rest").PaginateInterface;
} & import("@octokit/plugin-rest-endpoint-methods/dist-types/generated/method-types").RestEndpointMethods & import("@octokit/plugin-rest-endpoint-methods/dist-types/types").Api & import("@probot/octokit-plugin-config/dist-types/types").API>;
export {};
