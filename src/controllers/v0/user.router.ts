import { Router, Request, Response } from 'express';
import { User } from '../../models/User';
import AuthController  from './auth.controller';
const router: Router = Router();

class UserController{
    static async getAll(req : Request, res : Response){
        const users = await User.findAll();
        return res.status(200).json(users);
    }

    static async getOne(req : Request, res : Response){
        const id = req.params.id;
        const user = await User.findByPk(id);
        return res.status(200).json(user);
    }

    static async update(req : Request, res : Response){
        const updateduser = req.body;
        const { id } = req.params;
        const user = await User.findByPk(id);
        await User.update(updateduser, { where: { id: Number(id) } });
        return res.status(200).json(updateduser);
    }

    static async create(req : Request, res : Response){
        const newuser = req.body;

        const user = await User.create({
            type: newuser.type,
            ownership: newuser.ownership,
            email:newuser.email,
            fullName:newuser.fullName,
            passwordHash:newuser.password,
        });
        user.hashPassword();
        return res.status(200).json(user);
    }

    static async delete(req : Request, res : Response){
        const { id } = req.params;
        const userToDelete = await User.findOne({ where: { id: Number(id) } });
        if (userToDelete) {
            const DeletedUser = await User.destroy({
            where: { id: Number(id) }
            });
            return DeletedUser;
        }
    }
}



router.post('/auth/login', AuthController.Login);
router.get('/', AuthController.CheckAuthentication ,  UserController.getAll);
router.get('/:id', UserController.getOne);
router.post('/', UserController.create);
router.patch('/:id', UserController.update);
router.delete('/:id', UserController.delete);
export const UserRouter: Router = router;