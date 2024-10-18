ssh postgres@172.105.151.74 'pg_dump -U postgres tradingdb -F p -f tradingdb_backup.sql'
scp root@172.105.151.74:/var/lib/pgsql/tradingdb_backup.sql .
/usr/local/Cellar/postgresql@17/17.0_1/bin/psql -U postgres -c "drop database tradingdb"
echo "Sleeping for 10 seconds..."
sleep 2
/usr/local/Cellar/postgresql@17/17.0_1/bin/psql -U postgres -c "CREATE DATABASE tradingdb;" 
echo "Sleeping for 10 seconds..."
sleep 2
/usr/local/Cellar/postgresql@17/17.0_1/bin/psql -U postgres -c tradingdb -f ./tradingdb_backup.sql
