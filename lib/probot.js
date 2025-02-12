"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Probot = void 0;
const lru_cache_1 = __importDefault(require("lru-cache"));
const alias_log_1 = require("./helpers/alias-log");
const auth_1 = require("./auth");
const get_log_1 = require("./helpers/get-log");
const get_probot_octokit_with_defaults_1 = require("./octokit/get-probot-octokit-with-defaults");
const get_webhooks_1 = require("./octokit/get-webhooks");
const probot_octokit_1 = require("./octokit/probot-octokit");
const version_1 = require("./version");
class Probot {
    static defaults(defaults) {
        const ProbotWithDefaults = class extends this {
            constructor(...args) {
                const options = args[0] || {};
                super(Object.assign({}, defaults, options));
            }
        };
        return ProbotWithDefaults;
    }
    constructor(options = {}) {
        options.secret = options.secret || "development";
        let level = options.logLevel;
        const logMessageKey = options.logMessageKey;
        this.log = (0, alias_log_1.aliasLog)(options.log || (0, get_log_1.getLog)({ level, logMessageKey }));
        // TODO: support redis backend for access token cache if `options.redisConfig`
        const cache = new lru_cache_1.default({
            // cache max. 15000 tokens, that will use less than 10mb memory
            max: 15000,
            // Cache for 1 minute less than GitHub expiry
            maxAge: 1000 * 60 * 59,
        });
        const Octokit = (0, get_probot_octokit_with_defaults_1.getProbotOctokitWithDefaults)({
            githubToken: options.githubToken,
            Octokit: options.Octokit || probot_octokit_1.ProbotOctokit,
            appId: Number(options.appId),
            privateKey: options.privateKey,
            cache,
            log: this.log,
            redisConfig: options.redisConfig,
            baseUrl: options.baseUrl,
        });
        const octokit = new Octokit();
        this.state = {
            cache,
            githubToken: options.githubToken,
            log: this.log,
            Octokit,
            octokit,
            webhooks: {
                secret: options.secret,
            },
            appId: Number(options.appId),
            privateKey: options.privateKey,
            host: options.host,
            port: options.port,
        };
        this.auth = auth_1.auth.bind(null, this.state);
        this.webhooks = (0, get_webhooks_1.getWebhooks)(this.state);
        this.on = this.webhooks.on;
        this.onAny = this.webhooks.onAny;
        this.onError = this.webhooks.onError;
        this.version = version_1.VERSION;
    }
    receive(event) {
        this.log.debug({ event }, "Webhook received");
        return this.webhooks.receive(event);
    }
    async load(appFn, options = {}) {
        if (Array.isArray(appFn)) {
            for (const fn of appFn) {
                await this.load(fn);
            }
            return;
        }
        return appFn(this, options);
    }
}
exports.Probot = Probot;
Probot.version = version_1.VERSION;
//# sourceMappingURL=probot.js.map