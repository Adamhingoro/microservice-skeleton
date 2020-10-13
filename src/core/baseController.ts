import { Router, Request, Response } from 'express';
import {
    createValidator, ContainerTypes, ValidatedRequestSchema, ValidatedRequest
} from 'express-joi-validation'
export abstract class BaseController{
    abstract async getAll(req: Request, res: Response) : Promise<any>;
    abstract async getOne(req: Request, res: Response) : Promise<any>;
    abstract async update(req: Request, res: Response) : Promise<any>;
    abstract async create(req: Request, res: Response) : Promise<any>;
    abstract async enable(req: Request, res: Response) : Promise<any>;
    abstract async disable(req: Request, res: Response) : Promise<any>;
    abstract async delete(req: Request, res: Response) : Promise<any>;

    public static generateRouter<T extends BaseController>(this: new () => T, AuthCheck: any[] , SchemaforNewObject : any , SchemaforUpdatingObject : any ): Router{
        const controller = new this();
        const router: Router = Router();
        const validator = createValidator();
        router.post('/', [...AuthCheck, validator.body(SchemaforNewObject)], controller.create);
        router.patch('/:id', [...AuthCheck, validator.body(SchemaforUpdatingObject)], controller.update);
        router.patch('/:id/enable', AuthCheck, controller.enable);
        router.patch('/:id/disable', AuthCheck, controller.disable);
        router.get('/', AuthCheck, controller.getAll);
        router.get('/:id', AuthCheck, controller.getOne);
        router.delete('/:id', AuthCheck, controller.delete);
        return router;
    }
}