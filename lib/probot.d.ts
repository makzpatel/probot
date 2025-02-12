import { Logger } from "pino";
import { EmitterWebhookEvent as WebhookEvent } from "@octokit/webhooks";
import { ProbotOctokit } from "./octokit/probot-octokit";
import { ApplicationFunction, ApplicationFunctionOptions, DeprecatedLogger, Options, ProbotWebhooks } from "./types";
export type Constructor<T> = new (...args: any[]) => T;
export declare class Probot {
    static version: string;
    static defaults<S extends Constructor<any>>(this: S, defaults: Options): {
        new (...args: any[]): {
            [x: string]: any;
        };
    } & S;
    webhooks: ProbotWebhooks;
    log: DeprecatedLogger;
    version: String;
    on: ProbotWebhooks["on"];
    onAny: ProbotWebhooks["onAny"];
    onError: ProbotWebhooks["onError"];
    auth: (installationId?: number, log?: Logger) => Promise<InstanceType<typeof ProbotOctokit>>;
    private state;
    constructor(options?: Options);
    receive(event: WebhookEvent): Promise<void>;
    load(appFn: ApplicationFunction | ApplicationFunction[], options?: ApplicationFunctionOptions): Promise<void>;
}
