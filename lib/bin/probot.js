"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const semver_1 = __importDefault(require("semver"));
const commander_1 = __importDefault(require("commander"));
require("dotenv").config();
const pkg = require("../../package");
if (!semver_1.default.satisfies(process.version, pkg.engines.node)) {
    console.log(`Node.js version ${pkg.engines.node} is required. You have ${process.version}.`);
    process.exit(1);
}
commander_1.default
    .version(pkg.version)
    .usage("<command> [options]")
    .command("run", "run the bot")
    .command("receive", "Receive a single event and payload")
    .on("command:*", (cmd) => {
    if (!commander_1.default.commands.find((c) => c._name == cmd[0])) {
        console.error(`Invalid command: ${commander_1.default.args.join(" ")}\n`);
        commander_1.default.outputHelp();
        process.exit(1);
    }
});
commander_1.default.parse(process.argv);
//# sourceMappingURL=probot.js.map