
import { Result } from '../../controller/result';
import express from 'express';
import { Employee } from '../../controller/employee';
export const router = express.Router();
export default router;

router.post('/', async function (req: any, res: any, next: any) {
	try {
		const result = await Employee.register(req);
		if (result && result.success) {
			result.message =('Employee saved successfully!');
		}
		res.status(result.statusCode);
		return res.json(result);
	} catch (error: any) {
		return res.json(Result.error((error)));
	}
});
