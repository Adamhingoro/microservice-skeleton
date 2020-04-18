import { Router, Request, Response } from 'express';
import { Customer } from '../../models/Customer';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'

const router: Router = Router();

// restaurant Controller

class CustomerController{
    static async getAll(req : Request, res : Response){
        const items = await Customer.findAll();
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        Customer.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async update(req : ValidatedRequest<CustomerSchemaRequest>, res : Response){
        const updated = req.body;
        const { id } = req.params;
        const item = await Customer.findByPk(id);
        if(item === null){
            res.status(400).json({
                "message" : "Unable to find the item",
            });
        } else {
            await Customer.update(updated, { where: { id: Number(id) } });
            return res.status(200).json(updated);
        }

    }

    static async create(req : ValidatedRequest<CustomerSchemaRequest>, res : Response){
        try {
            const postItem = req.body;
            const item = await Customer.create({
                fullName: postItem.fullName,
                email: postItem.email,
                address: postItem.address,
                city: postItem.city,
                country: postItem.country,
                state: postItem.state,
            });
            return res.status(201).json(item);
        } catch (error) {
            return res.status(400).json(error);
        }
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const itemToDelete = await Customer.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            await Customer.destroy({
                where: { id: Number(id) }
            });
            res.status(200).json({
                "message" : "Customer Deleted",
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

const CustomerSchema = Joi.object({
    fullName:Joi.string().min(3).required(),
    email:Joi.string().min(3).required(),
    address:Joi.string().min(3).required(),
    city:Joi.string().min(3).required(),
    country:Joi.string().min(3).required(),
    state:Joi.string().min(3).required(),
});

interface CustomerSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        fullName: string,
        email: string,
        address: string,
        city: string,
        country: string,
        state: string,
    }
}

// Routes

router.post('/',  validator.body(CustomerSchema)  ,  CustomerController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication  , validator.body(CustomerSchema) ]  , CustomerController.update);
router.get('/', AuthController.CheckAuthentication  ,  CustomerController.getAll);
router.get('/:id' , CustomerController.getOne);
router.delete('/:id' , AuthController.CheckAuthentication   , CustomerController.delete);
export const CustomerRouter: Router = router;