import { Router, Request, Response } from 'express';
import { Menu } from '../../models/Menu';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'
import ObjectRequester from '../../util/objectRequester';

const router: Router = Router();

// Restaurent Controller

class MenuController{
    static async getAll(req : Request, res : Response){
        const items = await Menu.findAll();
        return res.status(200).json(items);
    }

    static async getByRestaurent(req : Request, res : Response){
        const id = req.params.id;
        const items = await Menu.findAll({
            where:{
                restaurentId: id
            }
        });
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        Menu.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async canTouch(req : Request, res : Response){
        const id = req.params.id;
        Menu.findByPk(id).then( async (item) => {
            if(item){
                const restaurent = await ObjectRequester.getRestaurent(req.token , item.restaurentId);
                if(restaurent)
                {
                    res.status(200).json(item);
                } else {
                    res.status(404).send("Not Found");
                }
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async update(req : ValidatedRequest<MenuSchemaRequest>, res : Response){
        const updated = req.body;
        const restaurent = await ObjectRequester.getRestaurent(req.token , updated.restaurentId);
        if(restaurent){
            const { id } = req.params;
            const item = await Menu.findByPk(id);
            if(item === null){
                res.status(400).json({
                    "message" : "Unable to find the item",
                });
            } else {
                await Menu.update(updated, { where: { id: Number(id) } });
                return res.status(200).json(updated);
            }
        } else {
            res.status(400).send("Not Possible");
        }
    }

    static async create(req : ValidatedRequest<MenuSchemaRequest>, res : Response){
        const postItem = req.body;
        const restaurent = await ObjectRequester.getRestaurent(req.token , postItem.restaurentId);
        console.log("RES" , restaurent);
        if(restaurent !== null){
            const item = await Menu.create({
                name: postItem.name,
                description: postItem.description,
                restaurentId:postItem.restaurentId,
            });
            return res.status(201).json(item);
        } else {
            return res.status(400).send("Not Possible");
        }
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const itemToDelete = await Menu.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            await Menu.destroy({
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

const MenuSchema = Joi.object({
    name:Joi.string().min(6).max(100).required(),
    description:Joi.string().min(6).max(100).required(),
    restaurentId:Joi.number().required(),
});

interface MenuSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string,
        description: string,
        restaurentId: number,
    }
}

// Routes

router.post('/', [ AuthController.CheckAuthentication  ,  validator.body(MenuSchema) ] ,  MenuController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication  , validator.body(MenuSchema) ]  , MenuController.update);
router.get('/', [ AuthController.CheckAuthentication ] ,  MenuController.getAll);
router.get('/:id'  , MenuController.getOne);
router.get('/cantouch/:id'  , MenuController.canTouch);
router.get('/restaurent/:id'  , MenuController.getByRestaurent);
router.delete('/:id' , [ AuthController.CheckAuthentication ]  , MenuController.delete);
export const MenuRouter: Router = router;