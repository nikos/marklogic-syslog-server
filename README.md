A proof of concept to route MarkLogic log messages written to syslog to a [MarkLogic](http://developer.marklogic.com/) database. 
The syslog server listens to UDP messages on a port. The lifecycle is: 

1. MarkLogic itself or user code running in MarkLogic logs a message (e.g. `xdmp.log()` in JavaScript) 
2. MarkLogic sends that message to the Error Log (`/var/opt/MarkLogic/Logs/ErrorLog.txt` on Linux) as well as syslog 
3. syslog, as configured below, hands off those messages to a designated `host:port` over UDP 
4. The marklogic-syslog-sever running in Node listens on that port, parses each message and writes as a JSON document to a MarkLogic database.  

## Set-up syslogd

Modify `/etc/syslog.conf` to configure syslogd to write messages to a specific UDP port, `5140`.

```
*.*									@127.0.0.1:5140
```

This says to send all facilities (first `*`) and levels (second `*`) to port `5140` on `localhost`. (`514` is the standard syslog port. You could use that as well.) Make sure to separate the facility-level match pattern and the host with tabs, not spaces.

Restart syslogd for the changes to take effect. 

On Linux:
```shell
killall -HUP syslogd
```

On OS X:
```shell
sudo launchctl unload /System/Library/LaunchDaemons/com.apple.syslogd.plist
sudo launchctl load /System/Library/LaunchDaemons/com.apple.syslogd.plist
```

Restart syslogd for the changes to take effect. 

On Linux:
```shell
killall -HUP syslogd
```

On OS X:
```shell
sudo launchctl unload /System/Library/LaunchDaemons/com.apple.syslogd.plist
sudo launchctl load /System/Library/LaunchDaemons/com.apple.syslogd.plist
```

Restart syslogd for the changes to take effect. 

On Linux:
```shell
killall -HUP syslogd
```

On OS X:
```shell
sudo launchctl unload /System/Library/LaunchDaemons/com.apple.syslogd.plist
sudo launchctl load /System/Library/LaunchDaemons/com.apple.syslogd.plist
```

**Caution:** This will send all syslog messages to port 5140. [I can’t figure](https://superuser.com/questions/844050/syslogd-filter-by-sender) out a way to filter by sender, rather than just the broader facility, which is `daemon` (`3`), in the case of MarkLogic.

## Configuring the Logs database

Use the UI [Configuration Manager](http://localhost:8002/) to import [database-config.zip](config/database-config.zip). This will create (or update) a database named `Logs`. Make sure you also set your syslog logging level on the group from which you’re sending logs. The syslog server host and the MarkLogic host do not need to be—and probably should not be—the same physical machine or even on the same subnet.

## Starting the syslog server

The script has no required parameters. Simply run it from the command-line `./marklogic-syslog-server.js` to use the defaults. 

```
Usage:
  node marklogic-syslog-server.js [<port>] [--delay <milliseconds> | --length <messages> | --host <host:port> | --user <user:password> | (--digest | --basic) ] [--help | -h]

Options:
  -h, --help               Help
  --delay <milliseconds>   Log buffer flush delay for writes [default: 1000]
  --length <messages>      Maximum buffer length before flushing [default: 200]
  --host <host:port>       The MarkLogic host to write to [default: localhost:8000]
  --database <name>        The MarkLogic database to write to [default: Logs]
  --user <user:password>   MarkLogic authentication [default: admin:********]
  --digest                 HTTP digest authentication
  --basic                  HTTP basic authentication
```
