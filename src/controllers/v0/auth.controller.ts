import { NextFunction, Request, Response } from 'express';
import { User } from '../../models/User';
import * as jwt from "jsonwebtoken";
import { config } from "../../config/config";

class AuthController{
    static async CheckAuthentication(req : Request , res : Response , next : NextFunction ){
        try {
            const token = req.headers.authorization.split(' ')[1] as string;

            let jwtPayload;

            try {
                jwtPayload = (jwt.verify(token, config.jwt.secret) as any);
                res.locals.jwtPayload = jwtPayload;
            } catch (error) {
                res.status(401).send();
                return;
            }

            const { userId, email , ownership , type , fullName} = jwtPayload;

            req.user = jwtPayload;

            const newToken = jwt.sign({ userId, email , ownership , type , fullName }, config.jwt.secret, {
                expiresIn: "1h"
            });
            res.setHeader("Authorization-Token", newToken);
            req.token = newToken;
            next();
        } catch (error) {
            console.log("Error " , error.message);
            res.status(401).send();
            return;
        }

    }

    static async OnlyAdmin(req : Request , res : Response , next : NextFunction ){
        if(req.user.type !== 1){
            return res.status(401).send();
        } else {
            next();
        }
    }

    static async OnlyRestaurantOwners(req : Request , res : Response , next : NextFunction ){
        if(req.user.type !== 2){
            return res.status(401).send();
        } else {
            next();
        }
    }

    static async Login(req: Request, res: Response){
        // Check if username and password are set
        const { email, password } = req.body;
        if (!(email && password)) {
          res.status(400).send();
        }

        // Get user from database
        let user: User;
        try {
          user = await User.findOne({ where: { email } });
        } catch (error) {
          res.status(401).send("Not Authorized");
          return;
        }

        if(!user){
          res.status(401).send("Not Authorized");
          return;
        }

        // Check if encrypted password match
        if (await !user.checkIfUnencryptedPasswordIsValid(password)) {
          res.status(401).send("Not Authorized");
          return;
        }

        // Sing JWT, valid for 1 hour
        const token = jwt.sign(
          { userId: user.id, email: user.email , ownership: user.ownership , type : user.type , fullName: user.fullName },
          config.jwt.secret,
          { expiresIn: "1h" }
        );

        // Send the jwt in the response
        res.status(200).json({
            "message" : "Authenticated successfully",
            "user" : { userId: user.id, email: user.email , ownership: user.ownership , type : user.type , fullName: user.fullName },
            "token" : token,
        });
    };
}

export default AuthController;