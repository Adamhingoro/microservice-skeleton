import { Router, Request, Response } from 'express';
import { Restaurent } from '../../models/Restaurent';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'

const router: Router = Router();

// Restaurent Controller

class RestaurentController{
    static async getAll(req : Request, res : Response){
        const items = await Restaurent.findAll();
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        const item = await Restaurent.findByPk(id);
        return res.status(200).json(item);
    }

    static async update(req : ValidatedRequest<RestaurentSchemaRequest>, res : Response){
        const updated = req.body;
        const { id } = req.params;
        const item = await Restaurent.findByPk(id);
        if(item === null){
            res.status(400).json({
                "message" : "Unable to find the item",
            });
        } else {
            await Restaurent.update(updated, { where: { id: Number(id) } });
            return res.status(200).json(updated);
        }
    }

    static async create(req : ValidatedRequest<RestaurentSchemaRequest>, res : Response){
        const postItem = req.body;

        const item = await Restaurent.create({
            name: postItem.name,
            address: postItem.address,
            city:postItem.city,
            country:postItem.country,
            state:postItem.state,
            cuisine:postItem.cuisine,
        });
        return res.status(200).json(item);
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const itemToDelete = await Restaurent.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            const DeletedUser = await Restaurent.destroy({
                where: { id: Number(id) }
            });
            res.status(200).json({
                "message" : "Restaurent Deleted",
            });
        } else {
            res.status(400).json({
                "message" : "could not found the Restaurent"
            });
        }
    }
}

// Here we have the Schemas for the Sequilize

const validator = createValidator();

const RestaurentSchema = Joi.object({
    name:Joi.string().min(6).max(100).required(),
    address:Joi.string().min(6).max(100).required(),
    city:Joi.string().min(3).max(100).required(),
    country:Joi.string().min(1).max(100).required(),
    state:Joi.string().min(1).max(100).required(),
    cuisine:Joi.string().min(1).max(100).required(),
});

interface RestaurentSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string,
        address: string,
        city: string,
        country: string,
        state: string,
        cuisine: string,
    }
}

// Routes

router.post('/', [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ,  validator.body(RestaurentSchema) ] ,  RestaurentController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication , AuthController.OnlyAdmin , validator.body(RestaurentSchema) ]  , RestaurentController.update);
router.get('/', [ AuthController.CheckAuthentication ] ,  RestaurentController.getAll);
router.get('/:id' , [ AuthController.CheckAuthentication ]  , RestaurentController.getOne);
router.delete('/:id' , [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ]  , RestaurentController.delete);
export const RestaurentRouter: Router = router;