import {Sequelize} from 'sequelize-typescript';
import { config } from '../config/config';
import { configure, getLogger, Logger } from "log4js";



const c = config.dev;

const _logger = getLogger("DATABASE");
_logger.level = "debug";
_logger.debug("Initialized");

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host":     c.host,

  "dialect" : "mysql", // have to put this constantsly. will find a workdaround this.
  storage: ':memory:',
  define:{
    underscored:true,
    paranoid: true,
    timestamps: true,

  },
  logging: msg => _logger.debug(msg),
});

