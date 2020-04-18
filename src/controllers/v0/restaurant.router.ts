import { Router, Request, Response } from 'express';
import { Restaurant } from '../../models/Restaurant';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'
import { v4 as uuidv4 } from "uuid";
import * as AWS from '../../util/AWS';
import { config } from "../../config/config";

const router: Router = Router();

// restaurant Controller

class RestaurantController{
    static async getAll(req : Request, res : Response){
        const items = await Restaurant.findAll();
        return res.status(200).json(items);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        Restaurant.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async update(req : ValidatedRequest<RestaurantSchemaRequest>, res : Response){

        const updated = req.body;
        const { id } = req.params;

        if(req.user.type === 2){ // If the user is owner.
            if(req.user.ownership !== id){
                res.status(401);
                return;
            }
        }

        const item = await Restaurant.findByPk(id);
        if(item === null){
            res.status(400).json({
                "message" : "Unable to find the item",
            });
        } else {
            await Restaurant.update(updated, { where: { id: Number(id) } });
            return res.status(200).json(updated);
        }
    }


    static async getUploadURL(req : Request, res : Response){
        const id = req.params.id;
        Restaurant.findByPk(id).then( (restaurant) => {
            if(restaurant){
                const ImageUUID = uuidv4();
                const url = AWS.getPutSignedUrl(ImageUUID);
                restaurant.imageURL = `https://${config.dev.aws_media_bucket}.s3.${config.dev.aws_reigion}.amazonaws.com/${ImageUUID}`;
                restaurant.save();
                res.status(201).json({
                    url,
                    uuid:ImageUUID,
                    restaurant,
                });
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async create(req : ValidatedRequest<RestaurantSchemaRequest>, res : Response){
        const postItem = req.body;

        const item = await Restaurant.create({
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
        const itemToDelete = await Restaurant.findOne({ where: { id: Number(id) } });
        if (itemToDelete) {
            const DeletedUser = await Restaurant.destroy({
                where: { id: Number(id) }
            });
            res.status(200).json({
                "message" : "restaurant Deleted",
            });
        } else {
            res.status(400).json({
                "message" : "could not found the restaurant"
            });
        }
    }
}

// Here we have the Schemas for the Sequilize

const validator = createValidator();

const RestaurantSchema = Joi.object({
    name:Joi.string().min(6).max(100).required(),
    address:Joi.string().min(6).max(100).required(),
    city:Joi.string().min(3).max(100).required(),
    country:Joi.string().min(1).max(100).required(),
    state:Joi.string().min(1).max(100).required(),
    cuisine:Joi.string().min(1).max(100).required(),
});

interface RestaurantSchemaRequest extends ValidatedRequestSchema {
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

router.post('/', [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ,  validator.body(RestaurantSchema) ] ,  RestaurantController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication , validator.body(RestaurantSchema) ]  , RestaurantController.update);
router.get('/' ,  RestaurantController.getAll);
router.get('/:id' , RestaurantController.getOne);
router.get('/imageurl/:id' , [ AuthController.CheckAuthentication ]  , RestaurantController.getUploadURL);
router.delete('/:id' , [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ]  , RestaurantController.delete);
export const RestaurantRouter: Router = router;