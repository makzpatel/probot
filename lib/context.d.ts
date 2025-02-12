import { EmitterWebhookEvent as WebhookEvent } from "@octokit/webhooks";
import merge from "deepmerge";
import type { Logger } from "pino";
import { ProbotOctokit } from "./octokit/probot-octokit";
import { DeprecatedLogger } from "./types";
import { EmitterWebhookEventName as WebhookEvents } from "@octokit/webhooks/dist-types/types";
export type MergeOptions = merge.Options;
/** Repo owner type, either string or never depending on the context */
type RepoOwnerType<T extends WebhookEvents> = WebhookEvent<T>["payload"] extends {
    repository: {
        owner: {
            login: string;
        };
    };
} ? string : never;
/** Repo name type, either string or never depending on the context */
type RepoNameType<T extends WebhookEvents> = WebhookEvent<T>["payload"] extends {
    repository: {
        name: string;
    };
} ? string : never;
/** Issue type (also pull request number), either number or never depending on the context */
type RepoIssueNumberType<T extends WebhookEvents> = WebhookEvent<T>["payload"] extends {
    issue: {
        number: number;
    };
} ? number : never | WebhookEvent<T>["payload"] extends {
    pull_request: {
        number: number;
    };
} ? number : never | WebhookEvent<T>["payload"] extends {
    number: number;
} ? number : never;
/** Context.repo return type */
type RepoResultType<E extends WebhookEvents> = {
    owner: RepoOwnerType<E>;
    repo: RepoNameType<E>;
};
/**
 * The context of the event that was triggered, including the payload and
 * helpers for extracting information can be passed to GitHub API calls.
 *
 *  ```js
 *  module.exports = app => {
 *    app.on('push', context => {
 *      context.log.info('Code was pushed to the repo, what should we do with it?');
 *    });
 *  };
 *  ```
 *
 * @property {octokit} octokit - An Octokit instance
 * @property {payload} payload - The webhook event payload
 * @property {log} log - A pino instance
 */
export declare class Context<E extends WebhookEvents = WebhookEvents> {
    name: WebhookEvents;
    id: string;
    payload: WebhookEvent<E>["payload"];
    octokit: InstanceType<typeof ProbotOctokit>;
    log: DeprecatedLogger;
    constructor(event: WebhookEvent<E>, octokit: InstanceType<typeof ProbotOctokit>, log: Logger);
    /**
     * Return the `owner` and `repo` params for making API requests against a
     * repository.
     *
     * ```js
     * const params = context.repo({path: '.github/config.yml'})
     * // Returns: {owner: 'username', repo: 'reponame', path: '.github/config.yml'}
     * ```
     *
     * @param object - Params to be merged with the repo params.
     *
     */
    repo<T>(object?: T): RepoResultType<E> & T;
    /**
     * Return the `owner`, `repo`, and `issue_number` params for making API requests
     * against an issue. The object passed in will be merged with the repo params.
     *
     *
     * ```js
     * const params = context.issue({body: 'Hello World!'})
     * // Returns: {owner: 'username', repo: 'reponame', issue_number: 123, body: 'Hello World!'}
     * ```
     *
     * @param object - Params to be merged with the issue params.
     */
    issue<T>(object?: T): RepoResultType<E> & {
        issue_number: RepoIssueNumberType<E>;
    } & T;
    /**
     * Return the `owner`, `repo`, and `pull_number` params for making API requests
     * against a pull request. The object passed in will be merged with the repo params.
     *
     *
     * ```js
     * const params = context.pullRequest({body: 'Hello World!'})
     * // Returns: {owner: 'username', repo: 'reponame', pull_number: 123, body: 'Hello World!'}
     * ```
     *
     * @param object - Params to be merged with the pull request params.
     */
    pullRequest<T>(object?: T): RepoResultType<E> & {
        pull_number: RepoIssueNumberType<E>;
    } & T;
    /**
     * Returns a boolean if the actor on the event was a bot.
     * @type {boolean}
     */
    get isBot(): boolean;
    /**
     * Reads the app configuration from the given YAML file in the `.github`
     * directory of the repository.
     *
     * For example, given a file named `.github/config.yml`:
     *
     * ```yml
     * close: true
     * comment: Check the specs on the rotary girder.
     * ```
     *
     * Your app can read that file from the target repository:
     *
     * ```js
     * // Load config from .github/config.yml in the repository
     * const config = await context.config('config.yml')
     *
     * if (config.close) {
     *   context.octokit.issues.comment(context.issue({body: config.comment}))
     *   context.octokit.issues.edit(context.issue({state: 'closed'}))
     * }
     * ```
     *
     * You can also use a `defaultConfig` object:
     *
     * ```js
     * // Load config from .github/config.yml in the repository and combine with default config
     * const config = await context.config('config.yml', {comment: 'Make sure to check all the specs.'})
     *
     * if (config.close) {
     *   context.octokit.issues.comment(context.issue({body: config.comment}));
     *   context.octokit.issues.edit(context.issue({state: 'closed'}))
     * }
     * ```
     *
     * Config files can also specify a base that they extend. `deepMergeOptions` can be used
     * to configure how the target config, extended base, and default configs are merged.
     *
     * For security reasons, configuration is only loaded from the repository's default branch,
     * changes made in pull requests from different branches or forks are ignored.
     *
     * If you need more lower-level control over reading and merging configuration files,
     * you can `context.octokit.config.get(options)`, see https://github.com/probot/octokit-plugin-config.
     *
     * @param fileName - Name of the YAML file in the `.github` directory
     * @param defaultConfig - An object of default config options
     * @param deepMergeOptions - Controls merging configs (from the [deepmerge](https://github.com/TehShrike/deepmerge) module)
     * @return Configuration object read from the file
     */
    config<T>(fileName: string, defaultConfig?: T, deepMergeOptions?: MergeOptions): Promise<T | null>;
}
export {};
