var docopt = require('docopt').docopt;
/*
var conn = {
  host: "localhost",
  port: 8000,
  database: "Logs",
  user: "admin",
  password: "********",
  authType: "DIGEST"
}
*/
// port
/*
  delay, length
*/

var doc = [
  "Usage:", 
  "  server.js [<port>] [--delay <milliseconds> | --length <messages> | --host <host:port> | --user <user:password> | (--digest | --basic) ] [--help | -h]",
  "",
  "Options:",
  "  -h, --help               Help",
  "  --delay <milliseconds>   Log buffer delay [default: 1000]",
  "  --length <messages>      Maximum buffer length before flushing [default: 200]",
  "  --host <host:port>       The MarkLogic host to write to [default: localhost:8000]",
  "  --database <name>        The MarkLogic database to write to [default: Logs]",
  "  --user <user:password>   MarkLogic authentication [default: admin:********]",
  "  --digest                 HTTP digest authentication",
  "  --basic                  HTTP basic authentication",
].join("\n");

console.log(docopt(doc));