import express from 'express';
import { sequelize } from './database/sequelize';


import bodyParser from 'body-parser';
import { config } from './config/config';
import { Models } from './models/index';
import { IndexRouter } from './routes/v1/index.router';
import { WebRouter } from './routes/web/auth.router';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { ContainerTypes } from 'express-joi-validation'









const c = config.dev;

(async () => {
  await sequelize.addModels(Models);
  await sequelize.sync({alter : false});

  const app = express();
  const port = process.env.PORT || 8080; // default port to listen

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));

  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Error handler for validations
    if (err && err.type in ContainerTypes) {
      const e:any = err
      res.status(400).json({
        type: err.type,
        message: err.error.toString()
      });
    } else {
      next();
    }
  })

  // CORS Should be restricted
  app.use((req:express.Request, res:express.Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods" , "*");
    next();
  });

  app.use('/api/'+config.application.api_version+'/', IndexRouter)
  app.use('/web/', WebRouter)

  // Root URI call
  app.get( "/", async ( req, res ) => {
      // we are returning the internal details here but soon this will be ristricted and only be monitoring and metrics purpose
      return res.status(200).json({
          "manifest" : config.application,
          "indexEndpoint" : '/api/'+config.application.api_version+'/'
      });
  } );

  app.get( "/login", async ( req, res ) => {
    // we are returning the internal details here but soon this will be ristricted and only be monitoring and metrics purpose
    return res.redirect("/web/login");
  } );
})();