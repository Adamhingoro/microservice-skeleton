import { Request, Response, NextFunction } from "express";
import { BaseModel } from "../models/BaseModel";


export interface ModelOperationsInterface {
  afterUpdate: (obj: BaseModel, body: any) => {};
  afterCreate: (obj: BaseModel, body: any) => {};
  afterEnable: (obj: BaseModel, body: any) => {};
  afterDisable: (obj: BaseModel, body: any) => {};
  afterDelete: (obj: BaseModel, body: any) => {};

  beforeUpdate: (req: Request, res: Response, next: NextFunction) => {};
  beforeCreate: (req: Request, res: Response, next: NextFunction) => {};
  beforeEnable: (req: Request, res: Response, next: NextFunction) => {};
  beforeDisable: (req: Request, res: Response, next: NextFunction) => {};
  beforeDelete: (req: Request, res: Response, next: NextFunction) => {};

  additionalWhereQuery:(req : Request) => {};
  includes: any;
}
