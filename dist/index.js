"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const os = require('os');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const server_1 = __importDefault(require("./src/controller/server"));
const util_1 = __importDefault(require("./src/controller/util"));
const body_parser_1 = __importDefault(require("body-parser"));
const apiVersion = require('./apiVersion.json');
exports.app = (0, express_1.default)();
require('dotenv').config();
exports.app.use(body_parser_1.default.json());
exports.app.get('/', (req, res) => {
    const result = {
        name: 'CODE-7',
        apiStartedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        host: os.hostname()
    };
    res.send(JSON.stringify(result));
});
class App {
    static async start(isTestMode = false) {
        App.isTestMode = isTestMode;
        const rootDir = util_1.default.rootDir();
        App.enableCORS();
        const result = server_1.default.loadAPIRoutes(exports.app);
        if (!result.success) {
            return result;
        }
        const server = await exports.app.listen(process.env.PORT);
        console.log(`api-v1-ocp running on port : ${process.env.PORT}` + ' ' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        // const swaggerDocument = YAML.load('./documentation.yml');
        // app.use('/doc/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
    static enableCORS() {
        exports.app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Methods', 'Content-Type, Authorization');
            if (req.headers['content-type'] === 'application/xml' || req.headers['accept'] === 'application/xml') {
                res.setHeader('Content-Type', 'application/xml');
            }
            if (req.url === '/usg/command.xml' && req.originalUrl === '/usg/command.xml') {
                req.url = '/usg/command';
                req.originalUrl = '/usg/command';
            }
            next();
        });
        exports.app.use(express_1.default.json());
        exports.app.use(express_1.default.urlencoded({
            extended: false
        }));
        exports.app.use(express_1.default.static(path_1.default.join(__dirname, '..', '/public')));
    }
}
App.isTestMode = false;
exports.default = App;
