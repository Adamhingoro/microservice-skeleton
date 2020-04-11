import { NextFunction, Request, Response } from 'express';
import { User } from '../../models/User';
import * as jwt from "jsonwebtoken";
import { config } from "../../config/config";

class AuthController{
    static async CheckAuthentication(req : Request , res : Response , next : NextFunction ){
        const token = req.headers.authorization.split(' ')[1] as string;
        let jwtPayload;

        try {
            jwtPayload = (jwt.verify(token, config.jwt.secret) as any);
            res.locals.jwtPayload = jwtPayload;
        } catch (error) {
            res.status(401).send();
            return;
        }

        const { userId, email , ownership , type } = jwtPayload;
        const newToken = jwt.sign({ userId, email , ownership , type }, config.jwt.secret, {
            expiresIn: "1h"
        });
        res.setHeader("Authorization-Token", newToken);

        next();
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
          res.status(401).send();
        }

        // Check if encrypted password match
        if (await !user.checkIfUnencryptedPasswordIsValid(password)) {
          res.status(401).send();
          return;
        }

        // Sing JWT, valid for 1 hour
        const token = jwt.sign(
          { userId: user.id, email: user.email , ownership: user.ownership , type : user.type },
          config.jwt.secret,
          { expiresIn: "1h" }
        );

        // Send the jwt in the response
        res.status(200).json({
            "message" : "Authenticated successfully",
            "token" : token,
        });
    };
}

export default AuthController;