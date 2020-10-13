import { SSL_OP_EPHEMERAL_RSA } from "constants";
import { watchFile } from "fs";
import { SSHConnection } from "./core/Connections/SSHConnection";


(async () => {
    const myconn = new SSHConnection();
    if (myconn.SetConnectionInfo({
        //   hostname : "shell.xshellz.com",
        //   port : 22,
        //   username : "adamhingoro",
        //   password : "QW4hddqcrg#",
        //   wordpressDirectory : "/test/dir"
        hostname: "localhost",
        port: 1022,
        username: "root",
        password: "foobar",
        wordpressDirectory: "/var/www/html"
    })) {
        if (await myconn.TestConnection()) {
            console.log("TestConnection successfully");
        };
        if (await myconn.Connect()) {
            console.log("Connect successfully");
        };
        // if (await myconn.Disconnect()) {
        //     console.log("Disconnect successfully");
        // };

    }
})();