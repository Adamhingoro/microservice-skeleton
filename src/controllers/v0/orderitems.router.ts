import { Router, Request, Response } from 'express';
import { OrderItem } from '../../models/OrderItem';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'
import ObjectRequester from '../../util/objectRequester';
import { Order } from '../../models/Order';

const router: Router = Router();

// restaurant Controller

class OrderItemController{
    static async getAll(req : Request, res : Response){
        const items = await OrderItem.findAll();
        return res.status(200).json(items);
    }

    static async getByMenuItem(req : Request, res : Response){
        const id = req.params.id;
        const items = await OrderItem.findAll({
            where:{
                menuItemId: id
            }
        });
        return res.status(200).json(items);
    }

    static async getByOrderId(req : Request, res : Response){
        const id = req.params.id;
        const items = await OrderItem.findAll({
            where:{
                orderId: id
            }
        });
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        OrderItem.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async update(req : ValidatedRequest<OrderItemSchemaRequest>, res : Response){
        const updated = req.body;
        const menuitem : any = await ObjectRequester.getMenuItem(req.token , updated.menuItemId);
        if(menuitem){
            const { id } = req.params;
            const item = await OrderItem.findByPk(id);
            if(item === null){
                res.status(400).json({
                    "message" : "Unable to find the item",
                });
            } else {
                await OrderItem.update(updated, { where: { id: Number(id) } });
                return res.status(200).json(updated);
            }
        } else {
            res.status(400).send("Not Possible");
        }
    }

    static async create(req : ValidatedRequest<OrderItemSchemaRequest>, res : Response){
        const postItem = req.body;
        const menuitem : any = await ObjectRequester.getMenuItem(req.token , postItem.menuItemId);
        const order = await Order.findByPk(postItem.orderId);
        console.log("RES" , menuitem);
        if(menuitem !== null && order !== null){
            const item = await OrderItem.create({
                orderId: postItem.orderId,
                menuItemId: postItem.menuItemId,
                quantity:postItem.quantity,
                price:menuitem.price,
                total:(menuitem.price * postItem.quantity)
            });
            order.CalculateTotals();
            return res.status(201).json(item);
        } else {
            return res.status(400).send("Not Possible");
        }
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const itemToDelete = await OrderItem.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            await OrderItem.destroy({
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

const validator = createValidator();

const OrderItemSchema = Joi.object({
    orderId:Joi.number().required(),
    menuItemId:Joi.number().required(),
    quantity:Joi.number().required(),
});

interface OrderItemSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        orderId: number,
        menuItemId: number,
        quantity: number,
    }
}

// Routes

router.post('/', [ validator.body(OrderItemSchema) ] ,  OrderItemController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication  , validator.body(OrderItemSchema) ]  , OrderItemController.update);
router.get('/', [ AuthController.CheckAuthentication ] ,  OrderItemController.getAll);
router.get('/:id'  , OrderItemController.getOne);
router.get('/menuitem/:id'  , OrderItemController.getByMenuItem);
router.get('/order/:id'  , OrderItemController.getByOrderId);
router.delete('/:id' , [ AuthController.CheckAuthentication ]  , OrderItemController.delete);
export const OrderItemRouter: Router = router;