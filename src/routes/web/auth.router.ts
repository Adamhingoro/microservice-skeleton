import { Router, Request, Response } from 'express';
import passport from 'passport';

const router: Router = Router();

router.get('/login', (req: Request, res: Response) => {
    return res.render('login');
});

router.post('/login', passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/web/login' }));


export const WebRouter: Router = router;