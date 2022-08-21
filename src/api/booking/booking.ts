import express from 'express';
import { Result } from '../../controller/result';
import { Booking } from '../../controller/booking';
import { Authenticate } from '../../controller/authenticate';
export const router = express.Router();
export default router;

router.post('/saveBooking', async function (req: any, res: any, next: any) {
	try {
        let result = await Authenticate.authenticateRequest(req);
		if (!result.success) {
			res.status(result.statusCode);
			return res.json(result);
		}
		result = await Booking.book(req.body);
		if (result && result.success) {
			result.message = ('Conference booked successfully.');
		}
		res.status(result.statusCode);
		return res.json(result);
	} catch (error: any) {
		return res.json(Result.error(error));
	}
});