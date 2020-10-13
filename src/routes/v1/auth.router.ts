import { Router, Request, Response } from "express";
import getUid, * as Oauth2Handlers from "../../utils/authentication";
import passport from "passport";
import AuthMiddleware from "../../middlewares/authMiddleware";
import Joi from "@hapi/joi";
import {
  createValidator,
  ContainerTypes,
  ValidatedRequestSchema,
  ValidatedRequest,
} from "express-joi-validation";
import { Users } from "../../models/Users";
import { SmsVerifications } from "../../models/SMSVerifications";
import { Profiles } from "../../models/Profiles";
import RestResponses from "../../utils/restresponses";

const router: Router = Router();
const validator = createValidator();

// Merchant Onboarding endpoints
const UserRegistrationSchema = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().required(),
  mobileNumber: Joi.string().required(),
  verificationtoken: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
});
interface UserRegistrationSchemaRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    name: string;
    username: string;
    email: string;
    mobileNumber: string;
    password: string;
    confirmPassword: string;
    verificationtoken: string;
  };
}
router.post(
  "/register",
  validator.body(UserRegistrationSchema),
  async (
    req: ValidatedRequest<UserRegistrationSchemaRequest>,
    res: Response
  ) => {
    Users.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then((user: Users) => {
        if (user) return RestResponses.Unauthorized(res);
        return user;
      })
      .then((user: Users) => {
        return SmsVerifications.findOne({
          where: {
            mobileNumber: req.body.mobileNumber,
            token: req.body.verificationtoken,
          },
        }).then((smsverification: SmsVerifications) => {
          if (!smsverification) return RestResponses.Unauthorized(res);
          if (!smsverification.isVerified)
            return RestResponses.Unauthorized(res);
          return;
        });
      })
      .then(() => {
        return Users.build({
          email: req.body.email,
          isSuperAdmin: false,
          username: req.body.username,
        })
          .hashPassword(req.body.password)
          .save();
      })
      .then((user: Users) => {
        return Profiles.build({
          mobileNumber: req.body.mobileNumber,
          name: req.body.name,
          userId: user.id,
        }).save();
      })
      .then((profile: Profiles) => {
        return RestResponses.Successful(res, profile);
      });
  }
);

const SmsVerificationSchema = Joi.object({
  mobileNumber: Joi.string().required(),
});
interface SmsVerificationSchemaRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    mobileNumber: string;
  };
}
router.post(
  "/initsmsverification",
  validator.body(SmsVerificationSchema),
  async (
    req: ValidatedRequest<SmsVerificationSchemaRequest>,
    res: Response
  ) => {
    SmsVerifications.findOne({
      where: {
        mobileNumber: req.body.mobileNumber,
      },
    })
      .then((smsverification: SmsVerifications) => {
        if (smsverification) return res.status(401).send();
        return;
      })
      .then(() => {
        return SmsVerifications.build({
          mobileNumber: req.body.mobileNumber,
          verificationCode: Math.floor(Math.random() * 999999) + 111111,
          isVerified: false,
        }).save();
      })
      .then((smsverification: SmsVerifications) => {
        return res.json({
          message: "SMS verification send",
          token: smsverification.verificationCode,
        });
      });
  }
);
const VerifymobileNumberSchema = Joi.object({
  mobileNumber: Joi.string().required(),
  verificationCode: Joi.string().required(),
});
interface VerifymobileNumberSchemaRequest extends ValidatedRequestSchema {
  [ContainerTypes.Body]: {
    mobileNumber: string;
    verificationCode: string;
  };
}
router.post(
  "/verifysms",
  validator.body(VerifymobileNumberSchema),
  async (
    req: ValidatedRequest<VerifymobileNumberSchemaRequest>,
    res: Response
  ) => {
    SmsVerifications.findOne({
      where: {
        mobileNumber: req.body.mobileNumber,
        verificationCode: req.body.verificationCode,
      },
    })
      .then((smsverification: SmsVerifications) => {
        if (!smsverification) return res.status(401).send();
        const verificationtoken = getUid(128); // randomly generate
        smsverification.isVerified = true;
        smsverification.token = verificationtoken;
        smsverification.save();
        return verificationtoken;
      })
      .then((verificationtoken: string) => {
        return res.json({
          message: "Mobile number Verified",
          token: verificationtoken,
        });
      });
  }
);

// OAuth Endpoints
router.get("/dialog/authorize", Oauth2Handlers.authorization);
router.post("/dialog/authorize/decision", Oauth2Handlers.decision);
router.post("/oauth/token", Oauth2Handlers.token);

// we are going to deprecate it. since we are not going to use any local authencation.
router.post(
  "/authenticate",
  passport.authenticate("local", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/web/login",
  })
);

// MiddleWares for Auth Check
const bearerSuperAdmin = [
  passport.authenticate("bearer", { session: false }),
  AuthMiddleware.OnlySuperAdmins,
];

router.get(
  "/oauth/profile",
  [passport.authenticate("bearer", { session: false })],
  (req: Request, res: Response) => {
    return RestResponses.Successful(res, req.user);
  }
);

// for testing the authentication
router.get("/safeplace", bearerSuperAdmin, (req: Request, res: Response) => {
  return res.json({
    message: "Welcome to the Auth Index",
    data: { user: req.user, authInfo: req.authInfo },
  });
});

export const authRouter: Router = router;
