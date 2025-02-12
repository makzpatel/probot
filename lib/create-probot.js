"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProbot = void 0;
const get_private_key_1 = require("@probot/get-private-key");
const get_log_1 = require("./helpers/get-log");
const probot_1 = require("./probot");
const DEFAULTS = {
    APP_ID: "",
    WEBHOOK_SECRET: "",
    GHE_HOST: "",
    GHE_PROTOCOL: "",
    LOG_FORMAT: "",
    LOG_LEVEL: "warn",
    LOG_LEVEL_IN_STRING: "",
    LOG_MESSAGE_KEY: "msg",
    REDIS_URL: "",
    SENTRY_DSN: "",
};
/**
 * Merges configuration from defaults/environment variables/overrides and returns
 * a Probot instance. Finds private key using [`@probot/get-private-key`](https://github.com/probot/get-private-key).
 *
 * @see https://probot.github.io/docs/configuration/
 * @param defaults default Options, will be overwritten if according environment variable is set
 * @param overrides overwrites defaults and according environment variables
 * @param env defaults to process.env
 */
function createProbot({ overrides = {}, defaults = {}, env = process.env, } = {}) {
    const privateKey = (0, get_private_key_1.getPrivateKey)({ env });
    const envWithDefaults = { ...DEFAULTS, ...env };
    const envOptions = {
        logLevel: envWithDefaults.LOG_LEVEL,
        appId: Number(envWithDefaults.APP_ID),
        privateKey: (privateKey && privateKey.toString()) || undefined,
        secret: envWithDefaults.WEBHOOK_SECRET,
        redisConfig: envWithDefaults.REDIS_URL,
        baseUrl: envWithDefaults.GHE_HOST
            ? `${envWithDefaults.GHE_PROTOCOL || "https"}://${envWithDefaults.GHE_HOST}/api/v3`
            : "https://api.github.com",
    };
    const probotOptions = {
        ...defaults,
        ...envOptions,
        ...overrides,
    };
    const logOptions = {
        level: probotOptions.logLevel,
        logFormat: envWithDefaults.LOG_FORMAT,
        logLevelInString: envWithDefaults.LOG_LEVEL_IN_STRING === "true",
        logMessageKey: envWithDefaults.LOG_MESSAGE_KEY,
        sentryDsn: envWithDefaults.SENTRY_DSN,
    };
    const log = (0, get_log_1.getLog)(logOptions).child({ name: "server" });
    return new probot_1.Probot({
        log: log.child({ name: "probot" }),
        ...probotOptions,
    });
}
exports.createProbot = createProbot;
//# sourceMappingURL=create-probot.js.map