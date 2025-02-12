"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAppFactory = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const child_process_1 = require("child_process");
const update_dotenv_1 = __importDefault(require("update-dotenv"));
const manifest_creation_1 = require("../manifest-creation");
const logging_middleware_1 = require("../server/logging-middleware");
const is_production_1 = require("../helpers/is-production");
const setupAppFactory = (host, port) => async function setupApp(app, { getRouter }) {
    const setup = new manifest_creation_1.ManifestCreation();
    // If not on Glitch or Production, create a smee URL
    if (!(0, is_production_1.isProduction)() &&
        !(process.env.PROJECT_DOMAIN ||
            process.env.WEBHOOK_PROXY_URL ||
            process.env.NO_SMEE_SETUP === "true")) {
        await setup.createWebhookChannel();
    }
    if (!getRouter) {
        throw new Error("getRouter is required to use the setup app");
    }
    const route = getRouter();
    route.use((0, logging_middleware_1.getLoggingMiddleware)(app.log));
    printWelcomeMessage(app, host, port);
    route.get("/probot", async (req, res) => {
        const baseUrl = getBaseUrl(req);
        const pkg = setup.pkg;
        const manifest = setup.getManifest(pkg, baseUrl);
        const createAppUrl = setup.createAppUrl;
        // Pass the manifest to be POST'd
        res.render("setup.handlebars", { pkg, createAppUrl, manifest });
    });
    route.get("/probot/setup", async (req, res) => {
        const { code } = req.query;
        const response = await setup.createAppFromCode(code);
        // If using glitch, restart the app
        if (process.env.PROJECT_DOMAIN) {
            (0, child_process_1.exec)("refresh", (error) => {
                if (error) {
                    app.log.error(error);
                }
            });
        }
        else {
            printRestartMessage(app);
        }
        res.redirect(`${response}/installations/new`);
    });
    route.get("/probot/import", async (_req, res) => {
        const { WEBHOOK_PROXY_URL, GHE_HOST } = process.env;
        const GH_HOST = `https://${GHE_HOST !== null && GHE_HOST !== void 0 ? GHE_HOST : "github.com"}`;
        res.render("import.handlebars", { WEBHOOK_PROXY_URL, GH_HOST });
    });
    route.post("/probot/import", body_parser_1.default.json(), async (req, res) => {
        const { appId, pem, webhook_secret } = req.body;
        if (!appId || !pem || !webhook_secret) {
            res.status(400).send("appId and/or pem and/or webhook_secret missing");
            return;
        }
        (0, update_dotenv_1.default)({
            APP_ID: appId,
            PRIVATE_KEY: `"${pem}"`,
            WEBHOOK_SECRET: webhook_secret,
        });
        res.end();
        printRestartMessage(app);
    });
    route.get("/probot/success", async (req, res) => {
        res.render("success.handlebars");
    });
    route.get("/", (req, res, next) => res.redirect("/probot"));
};
exports.setupAppFactory = setupAppFactory;
function printWelcomeMessage(app, host, port) {
    // use glitch env to get correct domain welcome message
    // https://glitch.com/help/project/
    const domain = process.env.PROJECT_DOMAIN ||
        `http://${host !== null && host !== void 0 ? host : "localhost"}:${port || 3000}`;
    [
        ``,
        `Welcome to Probot!`,
        `Probot is in setup mode, webhooks cannot be received and`,
        `custom routes will not work until APP_ID and PRIVATE_KEY`,
        `are configured in .env.`,
        `Please follow the instructions at ${domain} to configure .env.`,
        `Once you are done, restart the server.`,
        ``,
    ].forEach((line) => {
        app.log.info(line);
    });
}
function printRestartMessage(app) {
    app.log.info("");
    app.log.info("Probot has been set up, please restart the server!");
    app.log.info("");
}
function getBaseUrl(req) {
    const protocols = req.headers["x-forwarded-proto"] || req.protocol;
    const protocol = typeof protocols === "string" ? protocols.split(",")[0] : protocols[0];
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const baseUrl = `${protocol}://${host}`;
    return baseUrl;
}
//# sourceMappingURL=setup.js.map