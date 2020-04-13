import express from 'express';
import { sequelize } from './database/sequelize';

import { IndexRouter } from './controllers/v0/index.router';

import bodyParser from 'body-parser';
import { config } from './config/config';
import { Models } from './models/index';
import { User } from './models/User';
// var cors = require('cors')
import cors from "cors";

const c = config.dev;

(async () => {
  await sequelize.addModels(Models);
  await sequelize.sync();

  const app = express();
  const port = process.env.PORT || 8080; // default port to listen

  app.use(bodyParser.json());
  app.use(cors());

  // CORS Should be restricted
  app.use((req:express.Request, res:express.Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    console.log("GOT REQEUST");
    next();
  });

  app.use('/api/'+config.application.api_version+'/', IndexRouter)

  // Root URI call
  app.get( "/", async ( req, res ) => {
      // we are returning the internal details here but soon this will be ristricted and only be monitoring and metrics purpose
      return res.status(200).json({
          "manifest" : config.application,
          "indexEndpoint" : '/api/'+config.application.api_version+'/'
      });
  } );


  // Start the Server
  app.listen( port, () => {
      console.log( `server running ` + c.url );
      console.log( `press CTRL+C to stop server` );
  } );

  const userCheck = await User.findOne({ where : { email : "adam@gmail.com" }});
  if(userCheck === null){
    const user = await User.create({
      id: 1,
      type: 1,
      ownership: 0,
      email: "adam@gmail.com",
      fullName:"Adam Hingoro",
      passwordHash:"computer",
    });
    user.hashPassword();
    user.save();
    console.log("Super admin created");
  }

})();