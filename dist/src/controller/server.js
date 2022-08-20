"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("./util"));
const result_1 = require("./result");
class Server {
    static loadAPIRoutes(app, api_dir, app_name) {
        // api controller routes
        const apiDir = (api_dir) ? api_dir : path_1.default.join(util_1.default.rootDir(), 'src/api');
        if (fs_1.default.existsSync(apiDir)) {
            try {
                const subDir = fs_1.default.readdirSync(apiDir);
                subDir.forEach(function (dir) {
                    const subDirPath = path_1.default.join(apiDir, dir);
                    const apiFiles = fs_1.default.readdirSync(subDirPath);
                    apiFiles.forEach(function (api) {
                        if (Server._moduleRegExp.test(api)) {
                            const parts = api.match(Server._moduleRegExp);
                            const apiname = (parts) ? parts[1] : '';
                            const api_path = path_1.default.join(subDirPath, apiname);
                            const controller = require(api_path);
                            if (dir === apiname) {
                                app.use('/' + apiname, controller.default);
                            }
                            else {
                                app.use('/' + dir + '/' + apiname, controller.default);
                            }
                        }
                    });
                });
                return result_1.Result.success(null, `api routing is done successfully`);
            }
            catch (err) {
                return result_1.Result.error('err.message');
            }
        }
    }
}
exports.Server = Server;
Server._moduleRegExp = new RegExp('^([^.]+).(ts|js)$');
exports.default = Server;
