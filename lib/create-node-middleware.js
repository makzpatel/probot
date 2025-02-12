"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodeMiddleware = void 0;
const webhooks_1 = require("@octokit/webhooks");
function createNodeMiddleware(appFn, { probot, webhooksPath }) {
    probot.load(appFn);
    return (0, webhooks_1.createNodeMiddleware)(probot.webhooks, {
        path: webhooksPath || "/",
    });
}
exports.createNodeMiddleware = createNodeMiddleware;
//# sourceMappingURL=create-node-middleware.js.map