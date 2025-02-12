"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const express_1 = __importStar(require("express"));
const path_1 = require("path");
const webhooks_1 = require("@octokit/webhooks");
const get_log_1 = require("../helpers/get-log");
const logging_middleware_1 = require("./logging-middleware");
const webhook_proxy_1 = require("../helpers/webhook-proxy");
const version_1 = require("../version");
const express_handlebars_1 = require("express-handlebars");
class Server {
    constructor(options = {}) {
        this.version = version_1.VERSION;
        this.expressApp = (0, express_1.default)();
        this.log = options.log || (0, get_log_1.getLog)().child({ name: "server" });
        this.probotApp = new options.Probot();
        this.state = {
            port: options.port,
            host: options.host,
            webhookPath: options.webhookPath || "/",
            webhookProxy: options.webhookProxy,
        };
        this.expressApp.use((0, logging_middleware_1.getLoggingMiddleware)(this.log, options.loggingOptions));
        this.expressApp.use("/probot/static/", express_1.default.static((0, path_1.join)(__dirname, "..", "..", "static")));
        this.expressApp.use(this.state.webhookPath, (0, webhooks_1.createNodeMiddleware)(this.probotApp.webhooks, {
            path: "/",
        }));
        this.expressApp.engine("handlebars", (0, express_handlebars_1.engine)({
            defaultLayout: false,
        }));
        this.expressApp.set("view engine", "handlebars");
        this.expressApp.set("views", (0, path_1.join)(__dirname, "..", "..", "views"));
        this.expressApp.get("/ping", (req, res) => res.end("PONG"));
    }
    async load(appFn) {
        await appFn(this.probotApp, {
            getRouter: (path) => this.router(path),
        });
    }
    async start() {
        this.log.info(`Running Probot v${this.version} (Node.js: ${process.version})`);
        const port = this.state.port || 3000;
        const { host, webhookPath, webhookProxy } = this.state;
        const printableHost = host !== null && host !== void 0 ? host : "localhost";
        this.state.httpServer = (await new Promise((resolve, reject) => {
            const server = this.expressApp.listen(port, ...(host ? [host] : []), () => {
                if (webhookProxy) {
                    this.state.eventSource = (0, webhook_proxy_1.createWebhookProxy)({
                        logger: this.log,
                        path: webhookPath,
                        port: port,
                        url: webhookProxy,
                    });
                }
                this.log.info(`Listening on http://${printableHost}:${port}`);
                resolve(server);
            });
            server.on("error", (error) => {
                if (error.code === "EADDRINUSE") {
                    error = Object.assign(error, {
                        message: `Port ${port} is already in use. You can define the PORT environment variable to use a different port.`,
                    });
                }
                this.log.error(error);
                reject(error);
            });
        }));
        return this.state.httpServer;
    }
    async stop() {
        if (this.state.eventSource)
            this.state.eventSource.close();
        if (!this.state.httpServer)
            return;
        const server = this.state.httpServer;
        return new Promise((resolve) => server.close(resolve));
    }
    router(path = "/") {
        const newRouter = (0, express_1.Router)();
        this.expressApp.use(path, newRouter);
        return newRouter;
    }
}
exports.Server = Server;
Server.version = version_1.VERSION;
//# sourceMappingURL=server.js.map