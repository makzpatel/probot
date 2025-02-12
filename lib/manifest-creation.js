"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManifestCreation = void 0;
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const path_1 = __importDefault(require("path"));
const update_dotenv_1 = __importDefault(require("update-dotenv"));
const probot_octokit_1 = require("./octokit/probot-octokit");
class ManifestCreation {
    get pkg() {
        let pkg;
        try {
            pkg = require(path_1.default.join(process.cwd(), "package.json"));
        }
        catch (e) {
            pkg = {};
        }
        return pkg;
    }
    async createWebhookChannel() {
        try {
            // tslint:disable:no-var-requires
            const SmeeClient = require("smee-client");
            await this.updateEnv({
                WEBHOOK_PROXY_URL: await SmeeClient.createChannel(),
            });
        }
        catch (error) {
            // Smee is not available, so we'll just move on
            // tslint:disable:no-console
            console.warn("Unable to connect to smee.io, try restarting your server.");
        }
    }
    getManifest(pkg, baseUrl) {
        let manifest = {};
        try {
            const file = fs_1.default.readFileSync(path_1.default.join(process.cwd(), "app.yml"), "utf8");
            manifest = js_yaml_1.default.safeLoad(file);
        }
        catch (error) {
            // App config does not exist, which is ok.
            // @ts-ignore - in theory error can be anything
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
        const generatedManifest = JSON.stringify(Object.assign({
            description: manifest.description || pkg.description,
            hook_attributes: {
                url: process.env.WEBHOOK_PROXY_URL || `${baseUrl}/`,
            },
            name: process.env.PROJECT_DOMAIN || manifest.name || pkg.name,
            public: manifest.public || true,
            redirect_url: `${baseUrl}/probot/setup`,
            // TODO: add setup url
            // setup_url:`${baseUrl}/probot/success`,
            url: manifest.url || pkg.homepage || pkg.repository,
            version: "v1",
        }, manifest));
        return generatedManifest;
    }
    async createAppFromCode(code) {
        const octokit = new probot_octokit_1.ProbotOctokit();
        const options = {
            code,
            mediaType: {
                previews: ["fury"], // needed for GHES 2.20 and older
            },
            ...(process.env.GHE_HOST && {
                baseUrl: `${process.env.GHE_PROTOCOL || "https"}://${process.env.GHE_HOST}/api/v3`,
            }),
        };
        const response = await octokit.request("POST /app-manifests/:code/conversions", options);
        const { id, client_id, client_secret, webhook_secret, pem } = response.data;
        await this.updateEnv({
            APP_ID: id.toString(),
            PRIVATE_KEY: `"${pem}"`,
            WEBHOOK_SECRET: webhook_secret,
            GITHUB_CLIENT_ID: client_id,
            GITHUB_CLIENT_SECRET: client_secret,
        });
        return response.data.html_url;
    }
    async updateEnv(env) {
        // Needs to be public due to tests
        return (0, update_dotenv_1.default)(env);
    }
    get createAppUrl() {
        const githubHost = process.env.GHE_HOST || `github.com`;
        return `${process.env.GHE_PROTOCOL || "https"}://${githubHost}${process.env.GH_ORG ? "/organizations/".concat(process.env.GH_ORG) : ""}/settings/apps/new`;
    }
}
exports.ManifestCreation = ManifestCreation;
//# sourceMappingURL=manifest-creation.js.map