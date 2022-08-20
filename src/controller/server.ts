import fs from 'fs';
import path from 'path';
import Util from './util';
import { Result } from './result';

export class Server {
	public static config: any;
	static _moduleRegExp: any = new RegExp('^([^.]+).(ts|js)$');

	public static loadAPIRoutes(app: any, api_dir?: string, app_name?: string): Result|undefined {
		// api controller routes
		const apiDir: string = (api_dir) ? api_dir : path.join(Util.rootDir(), 'src/api');
		if (fs.existsSync(apiDir)) {
			try {
				const subDir = fs.readdirSync(apiDir);
				subDir.forEach(function (dir: any) {
					const subDirPath = path.join(apiDir, dir);
					const apiFiles = fs.readdirSync(subDirPath);

					apiFiles.forEach(function (api: string) {
							if (Server._moduleRegExp.test(api)) {
								const parts = api.match(Server._moduleRegExp);
								const apiname = (parts) ? parts[1] : '';
								const api_path = path.join(subDirPath, apiname);
								const controller = require(api_path);
								if (dir === apiname) {
									app.use('/' + apiname, controller.default);
								} else {
									app.use('/' + dir + '/' + apiname , controller.default);
								}
							}
					});

				});
				return Result.success(null, `api routing is done successfully`);
			} catch (err: any) {
				return Result.error('err.message');
			}

		}
	}
}
export default Server;
