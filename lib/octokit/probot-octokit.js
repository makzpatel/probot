"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProbotOctokit = void 0;
const core_1 = require("@octokit/core");
const plugin_enterprise_compatibility_1 = require("@octokit/plugin-enterprise-compatibility");
const plugin_paginate_rest_1 = require("@octokit/plugin-paginate-rest");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const plugin_retry_1 = require("@octokit/plugin-retry");
const plugin_throttling_1 = require("@octokit/plugin-throttling");
const octokit_plugin_config_1 = require("@probot/octokit-plugin-config");
const octokit_auth_probot_1 = require("octokit-auth-probot");
const octokit_plugin_probot_request_logging_1 = require("./octokit-plugin-probot-request-logging");
const version_1 = require("../version");
const defaultOptions = {
    authStrategy: octokit_auth_probot_1.createProbotAuth,
    throttle: {
        onAbuseLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(`Abuse limit hit with "${options.method} ${options.url}", retrying in ${retryAfter} seconds.`);
            return true;
        },
        onRateLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(`Rate limit hit with "${options.method} ${options.url}", retrying in ${retryAfter} seconds.`);
            return true;
        },
    },
    userAgent: `probot/${version_1.VERSION}`,
};
exports.ProbotOctokit = core_1.Octokit.plugin(plugin_throttling_1.throttling, plugin_retry_1.retry, plugin_paginate_rest_1.paginateRest, plugin_rest_endpoint_methods_1.legacyRestEndpointMethods, plugin_enterprise_compatibility_1.enterpriseCompatibility, octokit_plugin_probot_request_logging_1.probotRequestLogging, octokit_plugin_config_1.config).defaults((instanceOptions) => {
    // merge throttle options deeply
    const options = Object.assign({}, defaultOptions, instanceOptions, {
        throttle: instanceOptions.throttle
            ? Object.assign({}, defaultOptions.throttle, instanceOptions.throttle)
            : defaultOptions.throttle,
    });
    return options;
});
//# sourceMappingURL=probot-octokit.js.map