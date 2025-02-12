"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLog = void 0;
/**
 * A logger backed by [pino](https://getpino.io/)
 *
 * The default log level is `info`, but you can change it passing a level
 * string set to one of: `"trace"`, `"debug"`, `"info"`, `"warn"`,
 * `"error"`, or `"fatal"`.
 *
 * ```js
 * app.log.debug("…so is this");
 * app.log.trace("Now we're talking");
 * app.log.info("I thought you should know…");
 * app.log.warn("Woah there");
 * app.log.error("ETOOMANYLOGS");
 * app.log.fatal("Goodbye, cruel world!");
 * ```
 */
const pino_1 = __importDefault(require("pino"));
const pino_2 = require("@probot/pino");
function getLog(options = {}) {
    const { level, logMessageKey, ...getTransformStreamOptions } = options;
    const pinoOptions = {
        level: level || "info",
        name: "probot",
        messageKey: logMessageKey || "msg",
    };
    const transform = (0, pino_2.getTransformStream)(getTransformStreamOptions);
    // @ts-ignore TODO: check out what's wrong here
    transform.pipe(pino_1.default.destination(1));
    const log = (0, pino_1.default)(pinoOptions, transform);
    return log;
}
exports.getLog = getLog;
//# sourceMappingURL=get-log.js.map