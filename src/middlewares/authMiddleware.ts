import { NextFunction, Request, Response } from 'express';
import { Users } from '../models/Users';
import RestResponses from '../utils/restresponses';
class AuthMiddleware{
    static async OnlySuperAdmins(req : Request , res : Response, next : NextFunction){
        console.log("Only Super Admins");
        const user = req.user as Users;
        if(!user.isSuperAdmin){
            console.log("He is not Superadmin" , user);
            return RestResponses.Unauthorized(res);
        } else {
            next();
        }
    }
}

export default AuthMiddleware;