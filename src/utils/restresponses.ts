import { NextFunction, Request, Response } from 'express';
class RestResponses{
    private static objectType(object : any){
        if(object === undefined || object === null){
            return null;
        }
        let typeName = object.constructor.name;
        if(typeName === "Array"){
            if(object[0])
                typeName = object[0].constructor.name;
            else
                typeName = "EmptyList";
        }
        return typeName;
    }

    static ObjectNotFound( res : Response , name : string ){
        return res.status(404).json({
            message : "unable to find the resourse you are looking for.",
            status:"404",
            object : name,
        })
        .send();
    }
    static Unauthorized( res : Response ){
        return res.status(401).json({
            message : "You are not authorized to request the resource",
            status:"401"
        })
        .send();
    }
    static BadRequest( res : Response , message : string = "Bad input" ){
        return res.status(400).json({
            message,
            status:"400"
        })
        .send();
    }
    static InternalServerError( res : Response ){
        return res.status(500).json({
            message : "Servers are not working as expected. The request is probably valid but needs to be requested again later.",
            status:"500"
        })
        .send();
    }
    static Successful( res : Response , object : any  , message : string = "Successful"){
        const key = this.objectType(object);
        return res.status(200).json({
            message,
            status:"200",
            type: key,
            object
        })
        .send();
    }
    static ObjectCreated( res : Response , object : any  , message : string = "created successfully"){
        const key = this.objectType(object);
        return res.status(201).json({
            message,
            status:"201",
            type: key,
            object
        })
        .send();
    }

    static ObjectAlreadyEnabled( res : Response , name : string ){
        return res.status(400).json({
            message : "Bad request, " + name + " already enabled",
            status:"400"
        })
        .send();
    }

    static ObjectAlreadyDisabled( res : Response , name : string ){
        return res.status(400).json({
            message : "Bad request, " + name + " already disabled",
            status:"400"
        })
        .send();
    }

}

export default RestResponses;