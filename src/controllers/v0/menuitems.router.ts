import { Router, Request, Response } from 'express';
import { MenuItem } from '../../models/MenuItem';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'
import ObjectRequester from '../../util/objectRequester';
import { v4 as uuidv4 } from "uuid";
import * as AWS from '../../util/AWS';
import { config } from "../../config/config";

const router: Router = Router();

// restaurant Controller

class MenuItemController{
    static async getAll(req : Request, res : Response){
        const items = await MenuItem.findAll();
        return res.status(200).json(items);
    }

    static async getByMenu(req : Request, res : Response){
        const id = req.params.id;
        const items = await MenuItem.findAll({
            where:{
                menuId: id
            }
        });
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        MenuItem.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async getUploadURL(req : Request, res : Response){
        const id = req.params.id;
        MenuItem.findByPk(id).then( (item) => {
            if(item){
                const ImageUUID = uuidv4();
                const url = AWS.getPutSignedUrl(ImageUUID);
                item.imageURL = `https://${config.dev.aws_media_bucket}.s3.${config.dev.aws_reigion}.amazonaws.com/${ImageUUID}`;
                item.save();
                res.status(201).json({
                    url,
                    uuid:ImageUUID,
                    item,
                });
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async update(req : ValidatedRequest<MenuItemSchemaRequest>, res : Response){
        const updated = req.body;
        const menu = await ObjectRequester.getMenu(req.token , updated.menuId);
        if(menu){
            const { id } = req.params;
            const item = await MenuItem.findByPk(id);
            if(item === null){
                res.status(400).json({
                    "message" : "Unable to find the item",
                });
            } else {
                await MenuItem.update(updated, { where: { id: Number(id) } });
                return res.status(200).json(updated);
            }
        } else {
            res.status(400).send("Not Possible");
        }
    }

    static async create(req : ValidatedRequest<MenuItemSchemaRequest>, res : Response){
        const postItem = req.body;
        const menu = await ObjectRequester.getMenu(req.token , postItem.menuId);
        console.log("RES" , menu);
        if(menu !== null){
            const item = await MenuItem.create({
                name: postItem.name,
                description: postItem.description,
                menuId:postItem.menuId,
                price:postItem.price,
            });
            return res.status(201).json(item);
        } else {
            return res.status(400).send("Not Possible");
        }
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const itemToDelete = await MenuItem.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            await MenuItem.destroy({
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

const MenuItemSchema = Joi.object({
    name:Joi.string().min(6).max(100).required(),
    description:Joi.string().min(6).max(100).required(),
    menuId:Joi.number().required(),
    price:Joi.number().required(),
});

interface MenuItemSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string,
        description: string,
        menuId: number,
        price: number,
    }
}

// Routes

router.post('/', [ AuthController.CheckAuthentication  ,  validator.body(MenuItemSchema) ] ,  MenuItemController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication  , validator.body(MenuItemSchema) ]  , MenuItemController.update);
router.get('/', [ AuthController.CheckAuthentication ] ,  MenuItemController.getAll);
router.get('/:id'  , MenuItemController.getOne);
router.get('/imageurl/:id' , [ AuthController.CheckAuthentication ]  , MenuItemController.getUploadURL);
router.get('/menu/:id'  , MenuItemController.getByMenu);
router.delete('/:id' , [ AuthController.CheckAuthentication ]  , MenuItemController.delete);
export const MenuItemRouter: Router = router;