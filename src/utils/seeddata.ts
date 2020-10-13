import { AuthClients } from "../models/AuthClients"
import { Users } from "../models/Users";
import { Profiles } from "../models/Profiles";


export const InsertSeedData = () => {
    insertAuthClients();
    insertSuperAdmin();
}

const insertAuthClients = () => {
    AuthClients
    .bulkCreate([
        { name: "ABC Client 1", clientId: 'abc123', clientSecret: "abc123" , isTrusted : false },
        { name: "POSTMAN", clientId: 'postman', clientSecret: "postman" , isTrusted : false },
        { name: "MailMan", clientId: 'abcdefg', clientSecret: "abcdefg" , isTrusted : false },
        { name: "WebClient", clientId: 'thisisthewebclientId', clientSecret: "thisisthewebclientsecret" , isTrusted : true },
    ]).then(() => {
        return AuthClients.findAll();
    }).then((clients : AuthClients[]) => {
        console.log("Clients seeded ", clients);
    });
}

const insertSuperAdmin = () => {
    Users
    .build({
        username:"admin",
        email:"adam@gmail.com",
        isSuperAdmin: true,
        isEnabled : true,
    })
    .hashPassword("admin")
    .save()
    .then((newObject : Users) => {
        Profiles.build({
            userId: newObject.id,
            name : "Adam abdul shakoor",
            city : "Karachi" ,
            state : "Sindh",
            country : "Pakistan"
        })
        .save();
        console.log("Super admin created " , newObject.toJSON())
    })
    .catch((err : any) => {
        console.log("Error while inserting Users" , err);
    });
}