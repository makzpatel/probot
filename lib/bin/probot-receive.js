"use strict";
// Usage: probot receive -e push -p path/to/payload app.js
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
require("dotenv").config();
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const commander_1 = __importDefault(require("commander"));
const get_private_key_1 = require("@probot/get-private-key");
const get_log_1 = require("../helpers/get-log");
const __1 = require("../");
const resolve_app_function_1 = require("../helpers/resolve-app-function");
async function main() {
    commander_1.default
        .usage("[options] [path/to/app.js...]")
        .option("-e, --event <event-name>", "Event name", process.env.GITHUB_EVENT_NAME)
        .option("-p, --payload-path <payload-path>", "Path to the event payload", process.env.GITHUB_EVENT_PATH)
        .option("-t, --token <access-token>", "Access token", process.env.GITHUB_TOKEN)
        .option("-a, --app <id>", "ID of the GitHub App", process.env.APP_ID)
        .option("-P, --private-key <file>", "Path to private key file (.pem) for the GitHub App", process.env.PRIVATE_KEY_PATH)
        .option("-L, --log-level <level>", 'One of: "trace" | "debug" | "info" | "warn" | "error" | "fatal"', process.env.LOG_LEVEL)
        .option("--log-format <format>", 'One of: "pretty", "json"', process.env.LOG_LEVEL || "pretty")
        .option("--log-level-in-string", "Set to log levels (trace, debug, info, ...) as words instead of numbers (10, 20, 30, ...)", process.env.LOG_LEVEL_IN_STRING === "true")
        .option("--log-message-key", "Set to the string key for the 'message' in the log JSON object", process.env.LOG_MESSAGE_KEY || "msg")
        .option("--sentry-dsn <dsn>", 'Set to your Sentry DSN, e.g. "https://1234abcd@sentry.io/12345"', process.env.SENTRY_DSN)
        .option("--base-url <url>", 'GitHub API base URL. If you use GitHub Enterprise Server, and your hostname is "https://github.acme-inc.com", then the root URL is "https://github.acme-inc.com/api/v3"', process.env.GHE_HOST
        ? `${process.env.GHE_PROTOCOL || "https"}://${process.env.GHE_HOST}/api/v3`
        : "https://api.github.com")
        .parse(process.argv);
    const githubToken = commander_1.default.token;
    if (!commander_1.default.event || !commander_1.default.payloadPath) {
        commander_1.default.help();
    }
    const privateKey = (0, get_private_key_1.getPrivateKey)();
    if (!githubToken && (!commander_1.default.app || !privateKey)) {
        console.warn("No token specified and no certificate found, which means you will not be able to do authenticated requests to GitHub");
    }
    const payload = require(path_1.default.resolve(commander_1.default.payloadPath));
    const log = (0, get_log_1.getLog)({
        level: commander_1.default.logLevel,
        logFormat: commander_1.default.logFormat,
        logLevelInString: commander_1.default.logLevelInString,
        logMessageKey: commander_1.default.logMessageKey,
        sentryDsn: commander_1.default.sentryDsn,
    });
    const probot = new __1.Probot({
        appId: commander_1.default.app,
        privateKey: String(privateKey),
        githubToken: githubToken,
        log,
        baseUrl: commander_1.default.baseUrl,
    });
    const expressApp = (0, express_1.default)();
    const options = {
        getRouter: (path = "/") => {
            const newRouter = (0, express_1.Router)();
            expressApp.use(path, newRouter);
            return newRouter;
        },
    };
    const appFn = await (0, resolve_app_function_1.resolveAppFunction)(path_1.default.resolve(process.cwd(), commander_1.default.args[0]));
    await probot.load(appFn, options);
    probot.log.debug("Receiving event", commander_1.default.event);
    probot.receive({ name: commander_1.default.event, payload, id: (0, uuid_1.v4)() }).catch(() => {
        // Process must exist non-zero to indicate that the action failed to run
        process.exit(1);
    });
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=probot-receive.js.map