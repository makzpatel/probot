"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWebhooks = void 0;
const webhooks_1 = require("@octokit/webhooks");
const get_error_handler_1 = require("../helpers/get-error-handler");
const octokit_webhooks_transform_1 = require("./octokit-webhooks-transform");
// import { Context } from "../context";
function getWebhooks(state) {
    // TODO: This should be webhooks = new Webhooks<Context>({...}) but fails with
    //       > The context of the event that was triggered, including the payload and
    //         helpers for extracting information can be passed to GitHub API calls
    const webhooks = new webhooks_1.Webhooks({
        secret: state.webhooks.secret,
        transform: octokit_webhooks_transform_1.webhookTransform.bind(null, state),
    });
    webhooks.onError((0, get_error_handler_1.getErrorHandler)(state.log));
    return webhooks;
}
exports.getWebhooks = getWebhooks;
//# sourceMappingURL=get-webhooks.js.map