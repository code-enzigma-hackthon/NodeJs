import express from 'express';
import { Result } from '../../controller/result';
import { Employee } from '../../controller/employee';
import { Authenticate } from '../../controller/authenticate';
export const router = express.Router();
export default router;


router.get('/getInfo', async function (req: any, res: any, next: any) {
	try {
		let result = await Authenticate.authenticateRequest(req);
		if (!result.success) {
			res.status(result.statusCode);
			return res.json(result);
		}

		result = await Employee.getInfo();
		res.status(result.statusCode);
		return res.json(result);
	} catch (error: any) {
		return res.json(Result.error(error.message));
	}
});