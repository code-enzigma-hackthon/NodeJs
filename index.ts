
import express from 'express';
import path from 'path';

const os = require('os');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

import Server from './src/controller/server';
import Util from './src/controller/util';
import bodyParser, { json } from 'body-parser';

const apiVersion = require('./apiVersion.json');

export let app: any = express();
require('dotenv').config();
app.use(bodyParser.json());

app.get('/', (req: any, res: any) => {
	const result: any = {
		name: 'CODE-7',
		apiStartedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
		host: os.hostname()
	};
	res.send(JSON.stringify(result));

});

class App {
	static isTestMode: any = false;

	public static async start(isTestMode: any = false) {
		App.isTestMode = isTestMode;
		const rootDir = Util.rootDir();
		App.enableCORS();
		const result: any = Server.loadAPIRoutes(app);
		if (!result.success) {
			return result;
		}

		const server: any = await app.listen(process.env.PORT);
		console.log(`api-v1-ocp running on port : ${process.env.PORT}` + ' ' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
		// const swaggerDocument = YAML.load('./documentation.yml');
		// app.use('/doc/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
	}

	public static enableCORS() {	
		app.use(function (req: any, res: any, next: any) {
			res.header('Access-Control-Allow-Origin', '*');
			req.header('Content-Type', 'application/json');
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
		app.use(express.json());
		app.use(express.urlencoded({
			extended: false
		}));
		app.use(express.static(path.join(__dirname, '..', '/public')));
	}

}
export default App;
