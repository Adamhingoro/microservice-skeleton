import { Router, Request, Response } from 'express';
// Here is import different routers
import { UserRouter } from './user.router';
import { RestaurantRouter } from './restaurant.router';
import { MenuRouter } from './menu.router';
import { MenuItemRouter } from './menuitems.router';
import { OrderRouter } from './order.router';
import { CustomerRouter } from './customer.router';
import { OrderItemRouter } from './orderitems.router';

const router: Router = Router();

// Here we use different routers.
router.use('/users', UserRouter);
router.use('/restaurants', RestaurantRouter);
router.use('/menus', MenuRouter);
router.use('/menuitems', MenuItemRouter);
router.use('/orders', OrderRouter);
router.use('/customers', CustomerRouter);
router.use('/orderitems', OrderItemRouter);

router.get('/', async (req: Request, res: Response) => {
    return res.json({
        message:"Welcome to the index page"
    });
});

export const IndexRouter: Router = router;