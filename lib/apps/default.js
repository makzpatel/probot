"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultApp = void 0;
const path_1 = __importDefault(require("path"));
function defaultApp(app, { getRouter }) {
    if (!getRouter) {
        throw new Error("getRouter() is required for defaultApp");
    }
    const router = getRouter();
    router.get("/probot", (req, res) => {
        let pkg;
        try {
            pkg = require(path_1.default.join(process.cwd(), "package.json"));
        }
        catch (e) {
            pkg = {};
        }
        res.render("probot.handlebars", pkg);
    });
}
exports.defaultApp = defaultApp;
//# sourceMappingURL=default.js.map