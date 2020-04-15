import { Router, Request, Response } from 'express';
import { User } from '../../models/User';
import AuthController  from './auth.controller';
import Joi from '@hapi/joi';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
  } from 'express-joi-validation'

const router: Router = Router();

// User Controller

class UserController{
    static async getAll(req : Request, res : Response){
        const users = await User.findAll();
        return res.status(200).json(users);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        User.findByPk(id).then( (item) => {
            if(item){
                res.status(200).json(item);
            } else {
                res.status(404).send("Not Found");
                return;
            }
        });
    }

    static async update(req : ValidatedRequest<UpdateUserSchemaRequest>, res : Response){
        const updateduser = req.body;
        const { id } = req.params;
        const user = await User.findByPk(id);
        if(user === null){
            res.status(400).json({
                "message" : "Unable to find the user",
            });
        } else {
            await User.update(updateduser, { where: { id: Number(id) } });
            return res.status(200).json(updateduser);
        }
    }

    static async create(req : ValidatedRequest<NewUserSchemaRequest>, res : Response){
        const postObject = req.body;

        if(postObject.password !== postObject.confirmPassword){
            return res.status(400).json({
                "message" : "Password not matched with confirm_password",
            });
        }
        const user = await User.create({
            type: postObject.type,
            ownership: postObject.ownership,
            email:postObject.email,
            fullName:postObject.fullName,
            passwordHash:postObject.password,
        });
        user.hashPassword();
        user.save();
        return res.status(200).json(user);
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const userToDelete = await User.findOne({ where: { id: Number(id) } });
        if (userToDelete) {
            if(userToDelete.id === req.user.id){
                res.status(401).json({
                    "message" : "Cant delete the user while you are logged in"
                });
                return;
            }

            const DeletedUser = await User.destroy({
            where: { id: Number(id) }
            });
            res.status(200).json({
                "message" : "User Deleted",
            })
            return DeletedUser;
        } else {
            res.status(400).json({
                "message" : "could not found the user"
            });
        }
    }
}

// Here we have the Schemas for the Sequilize

const validator = createValidator();

const UserSchema = Joi.object({
  fullName: Joi.string().required(),
  email: Joi.string().required(),
  ownership: Joi.number().required(),
  type:Joi.number().min(1).max(2).required(),
});
const newUserSchema = UserSchema.keys({
  password: Joi.string().min(6).max(20).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required()
});

interface NewUserSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        fullName: string,
        email :string,
        ownership:number,
        type:number,
        password:string,
        confirmPassword:string,
    }
}

interface UpdateUserSchemaRequest extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        fullName: string,
        email :string,
        ownership:number,
        type:number,
    }
}

// Routes

router.post('/auth/login', AuthController.Login);
router.post('/', [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ,  validator.body(newUserSchema) ] ,  UserController.create);
router.patch('/:id' , [ AuthController.CheckAuthentication , AuthController.OnlyAdmin , validator.body(UserSchema) ]  , UserController.update);
router.get('/', [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ] ,  UserController.getAll);
router.get('/:id' , [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ]  , UserController.getOne);
router.delete('/:id' , [ AuthController.CheckAuthentication , AuthController.OnlyAdmin ]  , UserController.delete);
export const UserRouter: Router = router;