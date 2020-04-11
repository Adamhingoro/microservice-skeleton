import { Router, Request, Response } from 'express';
// Here is import different routers
import { UserRouter } from './user.router';
import { RestaurentRouter } from './restaurent.router';

const router: Router = Router();

// Here we use different routers.
router.use('/users', UserRouter);
router.use('/restaurents', RestaurentRouter);

router.get('/', async (req: Request, res: Response) => {
    return res.json({
        message:"Welcome to the index page"
    });
});

export const IndexRouter: Router = router;