import { Router, Request, Response } from 'express';
import { authRouter } from './auth.router';
import { AdminRouter } from './admin/index.router';
// Here is import different routers
// import { UserRouter } from './users/routes/user.router';

const router: Router = Router();

// Here we use different routers.
// router.use('/users', UserRouter);
router.use('/auth' , authRouter);
router.use('/admin' , AdminRouter);

export const IndexRouter: Router = router;