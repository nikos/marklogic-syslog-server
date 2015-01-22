/* 
 *  Copyright 2014 MarkLogic
 *  
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  
 *     http://www.apache.org/licenses/LICENSE-2.0
 *  
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var parser = require('glossy').Parse;
var uuid = require('node-uuid');
var marklogic = require('marklogic');
var buff = require('buffertools');
var TimedBuffer = require('./timed-buffer.js');

/*
  <http://wiki.splunk.com/Community:HowTo_Configure_Mac_OS_X_Syslog_To_Forward_Data>
  
  /etc/syslog.conf
  # Add the following. Tabs, not spaces.
  *.*									@127.0.0.1:5140

  # Restart syslogd
  sudo launchctl unload /System/Library/LaunchDaemons/com.apple.syslogd.plist
  sudo launchctl load /System/Library/LaunchDaemons/com.apple.syslogd.plist
  
  # Write
  syslog -s -l DEBUG "Hello, world."
  
  # Query
  syslog -k Sender MarkLogic
  
  Facility 3: daemon
  RFC3164
  
 */
 
 // TODO: Make port number externally configurable

var docopt = require('docopt').docopt;
var doc = [
  "Usage:", 
  "  marklogic-syslog-server.js [<port>] [--delay <milliseconds> | --length <messages> | --host <host:port> | --user <user:password> | (--digest | --basic) ] [--help | -h]",
  "",
  "Options:",
  "  -h, --help               Help",
  "  --delay <milliseconds>   Log buffer flush delay for writes [default: 1000]",
  "  --length <messages>      Maximum buffer length before flushing [default: 200]",
  "  --host <host:port>       The MarkLogic host to write to [default: localhost:8000]",
  "  --database <name>        The MarkLogic database to write to [default: Logs]",
  "  --user <user:password>   MarkLogic authentication [default: admin:********]",
  "  --digest                 HTTP digest authentication",
  "  --basic                  HTTP basic authentication",
].join("\n");

var opts = docopt(doc);

if(!opts['<port>']) {opts['<port>'] = 514; } // No way to default arguments in docopt
else { opts['<port>'] = parseInt(opts['<port>'], 10);}

if(opts['-h'] || opts['--help']) {
  console.log(doc);
  process.exit(0);
}

var host = opts['--host'].split(':');
var auth = opts['--user'].split(':');
var conn = {
  host: host[0],
  port: parseInt(host[1], 10),
  database: opts['--database'],
  user: auth[0],
  password: auth[1],
}
if(opts['--digest'] || opts['--basic']) {
  if(opts['--digest']) { conn.authType = "DIGEST"; }
  else if(opts['--basic']) { conn.authType = "BASIC"; }
} else { // Default auth
  conn.authType = "DIGEST";
}

//console.log(opts);


var db = marklogic.createDatabaseClient(conn);
var buffer = new TimedBuffer(parseInt(opts['--delay'], 1000), parseInt(opts['--max-length'], 25));

buffer.on('flush', function(messages) {
  console.log("Writing " + messages.length + " messages.");
  db.documents.write(
    messages.map(function(message) {
      console.log("\t" + message.message.substring(0, 100));
      return {
        uri: "/" + uuid.v4() + ".json",
        collections: ["logs"],
        content: message
      }
    })
  ).
    result(function(response){
      //console.dir(JSON.stringify(response))
      //console.log(response.documents[0].uri);
    }, function(error) {
      console.error(error);
    });
});

server.on("message", function (msg, rinfo) {
  
  if(buff.indexOf(msg, "MarkLogic[") > 0) {
    var msgObj = parser.parse(msg.toString('utf8', 0));
    
    if(msgObj.message.match(/^MarkLogic\[\d+\]/)) {    
      msgObj.sender = "MarkLogic";
      var msgMatches = msgObj.message.match(/MarkLogic\[(\d+)\]: (.+)\n/);
      msgObj.pID = parseInt(msgMatches[1], 10);
      msgObj.message = msgMatches[2];
      delete msgObj.originalMessage;
      buffer.push(msgObj);
    } else {
      console.log("UNEXPECTED: " + msgObj.message);
    }
  }
});

server.on("listening", function () {
  var address = server.address();
  console.log("Syslog server listening " + address.address + ":" + address.port + "…");

});

server.bind(parseInt(opts['<port>'], 10));