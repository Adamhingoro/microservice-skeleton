
import { Router, Request, Response, NextFunction } from 'express';
import { Users } from '../../../models/Users';
// import Joi from '@hapi/joi';

import passport from 'passport';
import AuthMiddleware from '../../../middlewares/authMiddleware';
import { BaseRestControler } from '../../../core/baseRestController';
import { ModelOperationsBuilder } from '../../../core/ModelOperationsBuilder';
import * as Joi from '@hapi/joi';
import { Profiles } from '../../../models/Profiles';
import { configure, getLogger, Logger } from "log4js";


// Validation Schemas
const UserSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    isSuperAdmin: Joi.boolean().required(),
    isEnabled: Joi.boolean().required(),
    agencyId: Joi.number(),
    password: Joi.string().min(6).max(20),
    confirmPassword: Joi.string().valid(Joi.ref('password'))
});
const newUserSchema = UserSchema.keys({
    password: Joi.string().min(6).max(20).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required(),
    createProfile: Joi.boolean().default(false),
    createAgency: Joi.boolean().default(false),
});

// Authentcation Middleware
const AuthCheck = [
    passport.authenticate('bearer', { session: false }),
    // AuthMiddleware.OnlySuperAdmins,
];

const _logger = getLogger("ADMIN_USERS_CONTROLLER");
_logger.level = "debug";
_logger.debug("Initialized");



export const UserRouter: Router = BaseRestControler.generateRestRouter(Users, AuthCheck, newUserSchema, UserSchema,
    new ModelOperationsBuilder()
    .setBeforeCreate((req : Request , res : Response , next : NextFunction) => {
        const user = req.user as Users;
        if(!user.isSuperAdmin){
            req.body.isSuperAdmin = false;
            req.body.createProfile = false;
            req.body.createAgency = false;
        }
        next();
        return null;
    })
    .setAfterCreate((obj: Users, body: any) => {
        obj.hashPassword(body.password);
        obj.save();

        if(body.createProfile)
        {
            _logger.debug("Creating Profile");
            const userProfile = Profiles.build();
            userProfile.userId = obj.id;
            userProfile.isEnabled = true;
            userProfile.save().then( () => {
                _logger.debug("Profile Created...");
            });
        }
        if(body.createAgency)
        {
            // Create Agency Code
        }
        return obj;
    })
    .setAfterUpdate((obj: Users, body: any) => {
        console.log("Here we areeee");
        if(body.password !== undefined){
            if(body.password === body.confirmPassword){
                console.log("Updating the password");
                obj.hashPassword(body.password);
                obj.save();
            }
        }
        return obj;
    })
    .setAdditionalWhereQuery((req : Request) => {
        const user = req.user as Users;
        if(!user.isSuperAdmin){
            return {
                // some tenant ID or Company ID
            }
        } else {
            return [];
        }
    })
    // .setIncludes([Agency])
    .build()
)