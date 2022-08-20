import express from 'express';
import { Result } from '../../controller/result';
import { Employee } from '../../controller/employee';
export const router = express.Router();
export default router;

router.post('/', async function (req: any, res: any, next: any) {
	try {
		const result = await Employee.login(req.body);
		if (result && result.success) {
			result.message = ('Employee logged in successfully.');
		}
		res.status(result.statusCode);
		return res.json(result);
	} catch (error: any) {
		return res.json(Result.error(error));
	}
});
