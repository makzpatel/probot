"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const express_1 = require("express");
/**
 * Get an {@link http://expressjs.com|express} router that can be used to
 * expose HTTP endpoints
 *
 * @param path - the prefix for the routes
 * @returns an [express.Router](http://expressjs.com/en/4x/api.html#router)
 */
function getRouter(router, path) {
    if (path) {
        const newRouter = (0, express_1.Router)();
        router.use(path, newRouter);
        return newRouter;
    }
    return router;
}
exports.getRouter = getRouter;
//# sourceMappingURL=get-router.js.map