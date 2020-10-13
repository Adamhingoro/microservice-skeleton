import { Request, Response, NextFunction } from 'express';
import { BaseModel } from '../models/BaseModel';
import { ModelOperationsInterface } from "./ModelOperationsInterface";


export class ModelOperationsBuilder implements ModelOperationsInterface {
    afterEnable: (obj: BaseModel, body: any) => {};
    afterDisable: (obj: BaseModel, body: any) => {};
    afterDelete: (obj: BaseModel, body: any) => {};
    afterCreate = (obj: any, body: any) => {
        return obj;
    };
    afterUpdate = (obj: any, body: any) => {
        return obj;
    };

    additionalWhereQuery = (req: Request ): any => {
        return [];
    };

    beforeUpdate = (req: Request, res: Response, next: NextFunction): any => {
        next();
        return null;
    };


    beforeCreate = (req: Request, res: Response, next: NextFunction): any => {
        next();
        return null;
    };
    beforeEnable = (req: Request, res: Response, next: NextFunction): any => {
        next();
        return null;
    };
    beforeDisable = (req: Request, res: Response, next: NextFunction): any => {
        next();
        return null;
    };
    includes: any = [];

    beforeDelete = (req: Request, res: Response, next: NextFunction) : any  => {
        next();
        return null;
    };

    ////////////////////////////////////////////////////////////////

    public setAfterCreate(afterCreate : (obj: any, body: any)=>{} ){
        this.afterCreate = afterCreate;
        return this;
    }

    public setAdditionalWhereQuery(additionalWhereQuery : (req: Request)=>{} ){
        this.additionalWhereQuery = additionalWhereQuery;
        return this;
    }

    public setAfterUpdate(afterUpdate : (obj: any, body: any)=>{} ){
        this.afterUpdate = afterUpdate;
        return this;
    }

    public setBeforeUpdate(beforeUpdate : (req: Request, res: Response, next: NextFunction)=>{} ){
        this.beforeUpdate = beforeUpdate;
        return this;
    }

    public setBeforeDelete(beforeDelete : (req: Request, res: Response, next: NextFunction)=>{} ){
        this.beforeDelete = beforeDelete;
        return this;
    }

    public setBeforeCreate(beforeCreate : (req: Request, res: Response, next: NextFunction)=>{} ){
        this.beforeCreate = beforeCreate;
        return this;
    }

    public setBeforeEnable(beforeEnable : (req: Request, res: Response, next: NextFunction)=>{} ){
        this.beforeEnable = beforeEnable;
        return this;
    }

    public setBeforeDisable(beforeDisable : (req: Request, res: Response, next: NextFunction)=>{} ){
        this.beforeDisable = beforeDisable;
        return this;
    }

    public setIncludes(includes : any[] ){
        this.includes = includes;
        return this;
    }

    protected boilerForAfterOperations() {
        return (obj: any, body: any) => {
            return obj;
        }
    }

    protected boilerForBeforeOperations() {
        return (req: Request, res: Response, next: NextFunction) : any  => {
            next();
            return null;
        };
    }

    public build() : ModelOperationsInterface{
        return {
            afterDelete: (this.afterDelete) ? this.afterDelete : this.boilerForAfterOperations(),
            afterEnable: (this.afterEnable) ? this.afterDelete : this.boilerForAfterOperations(),
            afterDisable: (this.afterDisable) ? this.afterDelete : this.boilerForAfterOperations(),
            afterCreate: this.afterCreate,
            afterUpdate: this.afterUpdate,
            beforeUpdate: this.beforeUpdate,
            beforeCreate: this.beforeCreate,
            beforeEnable: this.beforeEnable,
            beforeDisable: this.beforeDisable,
            beforeDelete: this.beforeDelete,
            additionalWhereQuery: this.additionalWhereQuery,
            includes : this.includes
        } as ModelOperationsInterface;
    }


}
