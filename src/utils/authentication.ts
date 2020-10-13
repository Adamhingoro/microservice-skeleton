
import passport from 'passport';
import * as passportLocal from 'passport-local';
import { Users } from '../models/Users';
import { AuthClients } from '../models/AuthClients';
import { AuthAccessTokens } from '../models/AuthAccessTokens';
import * as passportHttp from "passport-http";
import * as passportOAuthClientPassword from "passport-oauth2-client-password";
import * as passportBearer from "passport-http-bearer";
import oauth2orize from 'oauth2orize';
import { AuthRefreshTokens } from '../models/AuthRefreshTokens';
import { AuthAuthorizationCodes } from '../models/AuthAuthorizationCodes';
import login from "connect-ensure-login";
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { Profiles } from '../models/Profiles';


const ClientPasswordStrategy = passportOAuthClientPassword.Strategy;
const LocalStrategy = passportLocal.Strategy;
const BasicStrategy = passportHttp.BasicStrategy;
const BearerStrategy = passportBearer.Strategy;

// @ts-ignore
import oauth2orizeext from "oauth2orize-openid";


passport.use(new LocalStrategy((username: string, password: string , done : any) => {
    Users.findOne({ where: {username} })
    .then( (user: Users) => {
        if(!user) return done(null , false);
        if(!user.isEnabled) return done(null , false);
        if (!user.validatePassword(password)) return done(null, false);
        console.log("Here");
        return done(null , user);
    })
    .catch((err) => {
        return done(err);
    });
}));

passport.serializeUser((user: Users, done) =>  done(null, user.id));

passport.deserializeUser((id : number, done) => {
    Users.findByPk(id).then((user: Users) => {
        done(null , user);
    }).catch(err => {
        done(err , null);
    })
});

function verifyClient(clientId: string , clientSecret: string, done: any) {
    AuthClients.findOne({
        where:{ clientId}
    }).then((client: AuthClients) => {
        if (client.clientSecret !== clientSecret) return done(null, false);
        return done(null , client);
    }).catch((err) => {
        return done(err , null);
    });
  }

  passport.use(new BasicStrategy(verifyClient));

  passport.use(new ClientPasswordStrategy(verifyClient));

  passport.use(new BearerStrategy(
    (accessToken: string, done: any) => {
        // check if the given token is OCID token or the AccessToken
        if(accessToken.split(".").length > 1){
            jwt.verify(accessToken ,  fs.readFileSync(path.join(__dirname, '../../private.key')) , (err , decoded : any) => {
                if(err) return done(err , null);
                // no need to hit the Users database for the lookup
                done(null , decoded , { scope: '*' });
            });

        } else {
            AuthAccessTokens.findOne({
                where:{token : accessToken}
            }).then((accessTokenObj: AuthAccessTokens) => {
                if(!accessTokenObj) return done(null , null);
                if(accessTokenObj.userId){
                    Users.findByPk(accessTokenObj.userId , {
                        include : [Profiles],
                    }).then((user: Users) => {
                        if(!user) return done(null , null);
                        if(!user.isEnabled) return done(null , null);
                        const userContext : any = {
                            ...user.toJSON(),
                            ...user.profile.toJSON()
                        }
                        delete userContext.profile;
                        delete userContext.id;
                        done(null , userContext , { scope: '*' });
                    }).catch(err => {
                        done(err , null);
                    });
                } else {
                    AuthClients.findOne({
                        where:{ clientId: accessTokenObj.clientId}
                    }).then((client: AuthClients) => {
                        return done(null , client , { scope: '*' });
                    }).catch((err) => {
                        return done(err , null);
                    });
                }
            }).catch((err) => {
                return done(err , null);
            });
        }
    }
  ));


const server = oauth2orize.createServer();

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
    AuthClients.findByPk(id).then((client: AuthClients) => {
        return done(null , client);
    }).catch((err) => {
        return done(err);
    });
  });

  server.grant(oauth2orizeext.grant.idToken((client : AuthClients, user : Users,req : any , done : any) => {
    const idToken = jwt.sign(generateJWTforUser(user , req.nonce ) , fs.readFileSync(path.join(__dirname, '../../private.key')) ,
    {
        expiresIn: 60 * 60,
        subject: getUid(32),
        audience: client.clientId,
        issuer : "https://adms-node-app.com", // we will put this in configs
    });
    done(null , idToken);
  }));

const issueTokens = async (userId : number , clientId: string , done: any) => {
    const client = await AuthClients.findOne({where: {
        clientId
    }});
    Users.findByPk(userId).then((user: Users) => {
        const accessToken = getUid(32);
        const refreshToken = getUid(32);
        console.log("AccessToken" , {
            token : accessToken,
            clientId : client.id,
            userId
        });
        AuthAccessTokens.build({
            token : accessToken,
            clientId: client.id,
            userId
        })
        .save()
        .then((atoken : AuthAccessTokens) => {
            AuthRefreshTokens.build({
                token : refreshToken,
                clientId : client.id,
                userId
            })
            .save()
            .then((rtoken : AuthRefreshTokens) => {
                const params = { username: user.username };
                return done(null, accessToken, refreshToken, params);
            })
            .catch((err) => {
                return done(err);
            });
        }).catch((err) => {
            return done(err);
        });
    }).catch((err) => {
        return done(err);
    });
}

server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = getUid(16);
    AuthAuthorizationCodes.build({
        code,
        clientId : client.id,
        redirectUri,
        userId : user.id,
        username : user.username
    })
    .save()
    .then((authcode : AuthAuthorizationCodes) => {
        return done(null , code);
    })
    .catch((err) => {
        return done(err);
    });
}));

server.grant(oauth2orize.grant.token((client, user, ares, done) => {
    issueTokens(user.id, client.clientId, done);
}));

server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
    AuthAuthorizationCodes.findOne({
        where:{code}
    })
    .then((authCode : AuthAuthorizationCodes) => {
        if(client.id !== authCode.clientId) return done(null, false);
        if(redirectUri !== authCode.redirectUri) return done(null, false);
        return issueTokens(authCode.userId, client.clientId, done);
    })
    .catch((err) => {
        return done(err);
    });
  }));





  server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    AuthClients.findOne({
        where: {clientId : client.clientId}
    })
    .then((localClient : AuthClients) => {
        if (!localClient) return done(null, false);
        if (localClient.clientSecret !== client.clientSecret) return done(null, false);
        Users.findOne({ where: {username} })
        .then( async (user: Users) => {
            if (user === null) return done(null, false);
            if (! (await user.validatePassword(password))) return done(null, false);
            console.log("current_user" , user);
            console.log("current_pass" , password);
            issueTokens(user.id, client.clientId, done);
        })
        .catch((err) => {
            return done(err);
        });
    })
    .catch((err) => {
        return done(err);
    });
  }));

  server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
    AuthClients.findOne({
        where: {clientId : client.clientId}
    })
    .then((localClient : AuthClients) => {
        if (!localClient) return done(null, false);
        if (localClient.clientSecret !== client.clientSecret) return done(null, false);
        issueTokens(null, client.clientId, done);
    })
    .catch((err) => {
        return done(err);
    });
  }));

  server.exchange(oauth2orize.exchange.refreshToken((client, authRefreshToken, scope, done) => {

    AuthRefreshTokens.findOne({
        where:{
            token: authRefreshToken
        }
    })
    .then((rtoken : AuthRefreshTokens) => {
        issueTokens(rtoken.id, client.id , (issueTokenError : any , accessToken : string, refreshToken : string) => {
            if (issueTokenError) {
                done(issueTokenError, null, null);
            }
            AuthAccessTokens.findOne({
                where:{
                    userId : rtoken.userId,
                    clientId : rtoken.clientId
                }
            })
            .then((atoken : AuthAccessTokens) => {
               return atoken.destroy();
            })
            .then(() => {
                return rtoken.destroy();
            })
            .then(() => {
                done(null, accessToken, refreshToken);
            })
            .catch((AccessTokenError) => {
               return done(AccessTokenError);
            });
        })
    });
  }));

  export const authorization = [
    login.ensureLoggedIn(),
    server.authorization((clientId, redirectUri, done) => {
        AuthClients.findOne({
            where:{
                clientId
            }
        })
        .then((authClient : AuthClients) => {
            // TODO add redirectURI to client to security enhancement
            // if(redirectUri !== authClient.redirectUri) return done(false);
            return done(null, authClient, redirectUri);
        })
        .catch((err) => {
            return done(err);
        });
    }, (client : AuthClients, user : Users, done : any) => {
      // Check if grant request qualifies for immediate approval
      // Auto-approve
      if (client.isTrusted === 1) return done(null, true);
      return AuthAccessTokens.findOne({
          where:{
              userId:user.id,
              clientId:client.clientId
          }
      })
      .then((previousToken : AuthAccessTokens) => {
        if(!previousToken) return done(null , false);
        return done(null , true);
      })
      .catch((err) => {
        console.log("NO previous token");
        return done(null , false);
      });
    }),
    (request : Request, response : Response) => {
      response.render('dialog', { transactionId: request.oauth2.transactionID, user: request.user, client: request.oauth2.client });
    },
  ];

  export const decision = [
    login.ensureLoggedIn(),
    server.decision(),
  ];

  export const token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler(),
  ];

/**
 * Return a unique identifier with the given `len`.
 *
 * @param {Number} length
 * @return {String}
 * @api private
 */
const getUid = (length: number) => {
    let uid = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charsLength = chars.length;

    for (let i = 0; i < length; ++i) {
      uid += chars[getRandomInt(0, charsLength - 1)];
    }

    return uid;
  };

  /**
   * Return a random int, used by `utils.getUid()`.
   *
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   * @api private
   */
  function getRandomInt(min:number, max:number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateJWTforUser(user : Users , nonce : string){
    return {
        email: user.email,
        username: user.username,
        nonce,
        ...user.profile
    }
  }

// Exporting the random generator
export default getUid;