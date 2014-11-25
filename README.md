A proof of concept to write MarkLogic messages to a [MarkLogic](http://developer.marklogic.com/) database. 

## Set-up syslogd

Modify `/etc/syslog.conf` to configure syslogd to write messages to a specific UDP port, `5140`.

```
*.*									@127.0.0.1:5140
```

This says to send all facilities (first `*`) and levels (second `*`) to port `5140` on `localhost`. `514` is the standard syslog port. Make sure to separate the facility-level match patter and the host with tabs, not spaces.

**Caution:** This will send all syslog messages to port 5140. [I can’t figure](https://superuser.com/questions/844050/syslogd-filter-by-sender) out a way to filter by sender, rather than just the broader facility, which is `daemon` (`3`), in the case of MarkLogic.

## Configuring the Logs database

Use the UI Configuration Manager [`http://hostname:8002`](http://localhost:8002/) to import [database-config.zip](/jmakeig/marklogic-syslog-server/blob/master/config/database-config.zip?raw=true). This will create (or update) a database named `Logs`. Make sure you also set your syslog logging level on the group from which you’re sending logs. The syslog server host and the MarkLogic host do not need to be (and probably should not) be the same physical machine.

## Starting the syslog server

```
Usage:
  marklogic-syslog-server.js [<port>] [--delay <milliseconds> | --length <messages> | --host <host:port> | --user <user:password> | (--digest | --basic) ] [--help | -h]

Options:
  -h, --help               Help
  --delay <milliseconds>   Log buffer delay [default: 1000]
  --length <messages>      Maximum buffer length before flushing [default: 200]
  --host <host:port>       The MarkLogic host to write to [default: localhost:8000]
  --database <name>        The MarkLogic database to write to [default: Logs]
  --user <user:password>   MarkLogic authentication [default: admin:********]
  --digest                 HTTP digest authentication
  --basic                  HTTP basic authentication
```