ssh postgres@172.105.151.74 'pg_dump -U postgres tradingdb -F p -f tradingdb_backup.sql'
scp root@172.105.151.74:/var/lib/pgsql/tradingdb_backup.sql .
