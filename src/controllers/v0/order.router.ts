import { Router, Request, Response } from 'express';
import { Order } from '../../models/Order';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'
import ObjectRequester from '../../util/objectRequester';

const router: Router = Router();

// restaurant Controller

class OrderController{
    static async getAll(req : Request, res : Response){
        if(req.user.ownership === 0){
            const items = await Order.findAll();
            return res.status(200).json(items);
        } else {
            const items = await Order.findAll({
                where:{
                    restaurantId: req.user.ownership
                }
            });
            return res.status(200).json(items);
        }

    }

    static async getByCustomer(req : Request, res : Response){
        const id = req.params.id;
        const items = await Order.findAll({
            where:{
                customerId: id
            }
        });
        return res.status(200).json(items);
    }

    static async getByResraurent(req : Request, res : Response){
        const id = req.params.id;
        const items = await Order.findAll({
            where:{
                restaurantId: id
            }
        });
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        Order.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async getAvailibleStatuses(req : Request, res : Response){
        res.status(200).json(OrderStatuses);
        return;
    }

    static async update(req : ValidatedRequest<OrderSchemaRequest>, res : Response){
        const updated = req.body;
        const { id } = req.params;
        const item = await Order.findByPk(id);
        if(item === null){
            res.status(400).json({
                "message" : "Unable to find the item",
            });
        } else {
            await Order.update(updated, { where: { id: Number(id) } });
            return res.status(200).json(updated);
        }
    }

    static async updateStatus(req : Request , res : Response){
        const { id , status } = req.params;
        const item = await Order.findByPk(id);
        if(item === null){
            res.status(400).json({
                "message" : "Unable to find the item",
            });
        } else {
            item.status = +status;
            console.log("ITEM" , item);
            item.save();
            return res.status(200).json(item);
        }
    }

    static async create(req : ValidatedRequest<OrderSchemaRequest>, res : Response){
        const postItem = req.body;
        const menu = await ObjectRequester.getRestaurant(req.token , postItem.restaurantId);
        const customer = await ObjectRequester.getCustomer(req.token , postItem.customerId);
        console.log("RES" , menu);
        if(menu !== null && customer !== null){
            const item = await Order.create({
                customerId: postItem.customerId,
                restaurantId: postItem.restaurantId,
                status: 1, // initial stage
            });
            return res.status(201).json(item);
        } else {
            return res.status(400).send("Not Possible");
        }
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const itemToDelete = await Order.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            await Order.destroy({
                where: { id: Number(id) }
            });
            res.status(200).json({
                "message" : "Menu Deleted",
            });
        } else {
            res.status(400).json({
                "message" : "could not found the Menu"
            });
        }
    }
}

// Here we have the Schemas for the Sequilize

const OrderStatuses = [
    "Pending",
    "Accepted",
    "Preparing",
    "Enroute",
    "Delivered",
]

const validator = createValidator();

const OrderSchema = Joi.object({
    customerId:Joi.number().required(),
    restaurantId:Joi.number().required(),
});

interface OrderSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        customerId: number,
        restaurantId: number,
    }
}

// Routes

router.post('/', [ validator.body(OrderSchema) ] ,  OrderController.create);
router.patch('/status/:id/:status'  , AuthController.CheckAuthentication  , OrderController.updateStatus);
router.patch('/:id' , [ AuthController.CheckAuthentication  , validator.body(OrderSchema) ]  , OrderController.update);
router.get('/', [ AuthController.CheckAuthentication ] ,  OrderController.getAll);
router.get('/statuses',  OrderController.getAvailibleStatuses);
router.get('/:id'  , OrderController.getOne);
router.get('/customer/:id' , AuthController.CheckAuthentication  , OrderController.getByCustomer);
router.get('/restaurant/:id' , AuthController.CheckAuthentication   , OrderController.getByResraurent);
router.delete('/:id' , [ AuthController.CheckAuthentication ]  , OrderController.delete);
export const OrderRouter: Router = router;