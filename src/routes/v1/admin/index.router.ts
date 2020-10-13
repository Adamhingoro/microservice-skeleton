import { Router } from 'express';
import { UserRouter } from './users.router';

const router: Router = Router();

// Here we use different routers.
// router.use('/users', UserRouter);
 router.use('/users' , UserRouter);

export const AdminRouter: Router = router;