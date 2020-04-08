import { Router, Request, Response } from 'express';
// Here is import different routers
// import { UserRouter } from './users/routes/user.router';

const router: Router = Router();

// Here we use different routers.
// router.use('/users', UserRouter);

router.get('/', async (req: Request, res: Response) => {
    return res.json({
        message:"Welcome to the index page"
    });
});

export const IndexRouter: Router = router;