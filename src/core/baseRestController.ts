import { BaseController } from "./baseController";
import { Router, Request, Response, NextFunction } from "express";
import { BaseModel } from "../models/BaseModel";
import RestResponses from "../utils/restresponses";
import { ValidatedRequest, createValidator } from "express-joi-validation";
import { BuildOptions } from "sequelize/types";
import { ModelOperationsInterface } from "./ModelOperationsInterface";
import { configure, getLogger, Logger } from "log4js";

type ModelStatic = typeof BaseModel &
  (new (values?: object, options?: BuildOptions) => BaseModel);

export class BaseRestControler extends BaseController {
  static generateRestRouter(
    DatabaseModel: ModelStatic,
    AuthCheck: any[],
    SchemaforNewObject: any,
    SchemaforUpdatingObject: any,
    Operations: ModelOperationsInterface
  ): Router {
    // Default Operations

    const controller = new this(DatabaseModel, Operations);
    const router: Router = Router();
    const validator = createValidator();

    // Help Endpoint
    router.get(
      "/help",
      [controller.beforeRequest, ...AuthCheck],
      async (_req: Request, res: Response) => {
        return RestResponses.Successful(res, {
          SchemaforNewObject: SchemaforNewObject.describe(),
          SchemaforUpdatingObject: SchemaforUpdatingObject.describe(),
        });
      }
    );

    // Create
    router.post(
      "/",
      [
        controller.beforeRequest,
        ...AuthCheck,
        validator.body(SchemaforNewObject),
        Operations.beforeCreate,
      ],
      controller.create
    );

    // Update
    router.patch(
      "/:id",
      [
        controller.beforeRequest,
        ...AuthCheck,
        validator.body(SchemaforUpdatingObject),
        Operations.beforeUpdate,
      ],
      controller.update
    );

    // Enable
    router.patch(
      "/:id/enable",
      [
        controller.beforeRequest,
        ...AuthCheck,
        Operations.beforeUpdate,
        Operations.beforeEnable,
      ],
      controller.enable
    );

    // Disable
    router.patch(
      "/:id/disable",
      [
        controller.beforeRequest,
        ...AuthCheck,
        Operations.beforeUpdate,
        Operations.beforeDisable,
      ],
      controller.disable
    );

    // Get all
    router.get(
      "/",
      [controller.beforeRequest, ...AuthCheck],
      controller.getAll
    );

    // Get One
    router.get(
      "/:id",
      [controller.beforeRequest, ...AuthCheck],
      controller.getOne
    );

    // Dellete
    router.delete(
      "/:id",
      [
        controller.beforeRequest,
        ...AuthCheck,
        Operations.beforeUpdate,
        Operations.beforeDelete,
      ],
      controller.delete
    );

    controller._logger = getLogger(
      "REST_CONTROLLER_" + DatabaseModel.name.toUpperCase()
    );
    controller._logger.level = "debug";
    controller._logger.debug("Initialized");
    return router;
  }

  protected dbModel: ModelStatic;
  protected ops: ModelOperationsInterface;
  protected _logger: Logger;

  constructor(
    DatabaseModel: ModelStatic,
    Operations: ModelOperationsInterface
  ) {
    super();
    this.dbModel = DatabaseModel;
    this.ops = Operations;
  }

  protected beforeRequest = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    this._logger.debug(
      "PERFORMING " + req.protocol + "://" + req.get("host") + req.originalUrl
    );
    next();
    return;
  };

  protected afterError(err: any, res: Response) {
    this._logger.error(err);
    return RestResponses.InternalServerError(res);
  }

  getAll: any = async (req: Request, res: Response) => {
    const users = await this.dbModel.findAll({ where: { ...this.ops.additionalWhereQuery(req) } , include: this.ops.includes });
    return RestResponses.Successful(res, users);
  };

  getOne: any = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.dbModel
      .findOne({ where: { id, ...this.ops.additionalWhereQuery(req) }, include: this.ops.includes })
      .then((singleObject: BaseModel) => {
        if (!singleObject) return RestResponses.ObjectNotFound(res, "Model");
        return singleObject;
      })
      .then((singleObject: BaseModel) => {
        return RestResponses.Successful(res, singleObject);
      })
      .catch((_err: any) => {
        return this.afterError(_err, res);
      });
  };

  update: any = async (req: ValidatedRequest<any>, res: Response) => {
    const id = req.params.id;
    return this.dbModel
      .findOne({ where: { id, ...this.ops.additionalWhereQuery(req) }, include: this.ops.includes })
      .then((singleObject: BaseModel) => {
        if (!singleObject) return RestResponses.ObjectNotFound(res, "Model");
        return singleObject;
      })
      .then((singleObject: BaseModel) => {
        return singleObject.set({ ...req.body , ...this.ops.additionalWhereQuery(req) }).save();
      })
      .then((newObject: BaseModel) => {
        return this.ops.afterUpdate(newObject, req.body);
      })
      .then((updatedObject: BaseModel) => {
        return RestResponses.Successful(res, updatedObject);
      })
      .catch((_err: any) => {
        return this.afterError(_err, res);
      });
  };

  create: any = async (req: ValidatedRequest<any>, res: Response) => {
    this.dbModel
      .build({ ...req.body , ...this.ops.additionalWhereQuery(req) })
      .save()
      .then((newObject: BaseModel) => {
        return this.ops.afterCreate(newObject, req.body);
      })
      .then((newObject: BaseModel) => {
        return RestResponses.ObjectCreated(res, newObject);
      })
      .catch((_err: any) => {
        return this.afterError(_err, res);
      });
  };

  delete: any = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.dbModel
      .findOne({ where: { id, ...this.ops.additionalWhereQuery(req) }, include: this.ops.includes })
      .then((singleObject: BaseModel) => {
        if (!singleObject) return RestResponses.ObjectNotFound(res, "Model");
        return singleObject;
      })
      .then((singleObject: BaseModel) => {
        return singleObject.destroy();
      })
      .then(() => {
        return RestResponses.Successful(res, null, "User deleted successfully");
      })
      .catch((_err: any) => {
        return this.afterError(_err, res);
      });
  };

  enable: any = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.dbModel
      .findOne({ where: { id, ...this.ops.additionalWhereQuery(req) }, include: this.ops.includes })
      .then((singleObject: BaseModel) => {
        if (!singleObject) return RestResponses.ObjectNotFound(res, "Model");
        if (singleObject.isEnabled)
          return RestResponses.ObjectAlreadyEnabled(res, "Model");
        return singleObject;
      })
      .then((singleObject: BaseModel) => {
        singleObject.isEnabled = true;
        singleObject.save();
        return RestResponses.Successful(res, singleObject);
      })
      .catch((_err: any) => {
        return this.afterError(_err, res);
      });
  };
  disable: any = async (req: Request, res: Response) => {
    const id = req.params.id;
    this.dbModel
      .findOne({ where: { id, ...this.ops.additionalWhereQuery(req) }, include: this.ops.includes })
      .then((singleObject: BaseModel) => {
        if (!singleObject) return RestResponses.ObjectNotFound(res, "Model");
        if (!singleObject.isEnabled)
          return RestResponses.ObjectAlreadyDisabled(res, "Model");
        return singleObject;
      })
      .then((singleObject: BaseModel) => {
        singleObject.isEnabled = false;
        singleObject.save();
        return RestResponses.Successful(res, singleObject);
      })
      .catch((_err: any) => {
        return this.afterError(_err, res);
      });
  };
}
