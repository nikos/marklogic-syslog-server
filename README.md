A proof of concept to write MarkLogic messages to a [MarkLogic](http://developer.marklogic.com/) database. 

## Set-up

Modify `/etc/syslog.conf` to configure syslogd to write messages to a specific UDP port, `5140`.

```
*.*									@127.0.0.1:5140
```

Make sure to separate with tabs, not spaces.

**Caution:** This will send all syslog messages to port 5140. [I can’t figure](https://superuser.com/questions/844050/syslogd-filter-by-sender) out a way to filter by sender, rather than just the broader facility.

## Starting

```sh
node marklogic-syslog-server.js 
```
