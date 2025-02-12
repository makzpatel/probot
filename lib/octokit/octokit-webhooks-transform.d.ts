import { EmitterWebhookEvent as WebhookEvent } from "@octokit/webhooks";
import { Context } from "../context";
import { State } from "../types";
/**
 * Probot's transform option, which extends the `event` object that is passed
 * to webhook event handlers by `@octokit/webhooks`
 * @see https://github.com/octokit/webhooks.js/#constructor
 */
export declare function webhookTransform(state: State, event: WebhookEvent): Promise<Context<"status" | "branch_protection_rule" | "check_run" | "check_suite" | "code_scanning_alert" | "commit_comment" | "create" | "delete" | "deploy_key" | "deployment" | "deployment_status" | "discussion" | "discussion_comment" | "fork" | "github_app_authorization" | "gollum" | "installation" | "installation_repositories" | "issue_comment" | "issues" | "label" | "marketplace_purchase" | "member" | "membership" | "meta" | "milestone" | "org_block" | "organization" | "package" | "page_build" | "ping" | "project" | "project_card" | "project_column" | "projects_v2_item" | "public" | "pull_request" | "pull_request_review" | "pull_request_review_comment" | "pull_request_review_thread" | "push" | "release" | "repository" | "repository_dispatch" | "repository_import" | "repository_vulnerability_alert" | "secret_scanning_alert" | "security_advisory" | "sponsorship" | "star" | "team" | "team_add" | "watch" | "workflow_dispatch" | "workflow_job" | "workflow_run">>;
