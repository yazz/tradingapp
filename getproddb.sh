echo "Backing up production database 'tradingdb' ..."
ssh postgres@172.105.151.74 'pg_dump -U postgres tradingdb -F p -f tradingdb_backup.sql'
echo "Copying production production database 'tradingdb' to local machine..."
scp root@172.105.151.74:/var/lib/pgsql/tradingdb_backup.sql .
/usr/local/Cellar/postgresql@17/17.0_1/bin/psql -U postgres -c "drop database tradingdb"
echo "Dropping local database 'tradingdb' ..."
sleep 2
/usr/local/Cellar/postgresql@17/17.0_1/bin/psql -U postgres -c "CREATE DATABASE tradingdb;" 
echo "Creating local database 'tradingdb' ..."
sleep 2
echo "Copy production backup database 'tradingdb' to your local machine..."
/usr/local/Cellar/postgresql@17/17.0_1/bin/psql -U postgres -d tradingdb -f ./tradingdb_backup.sql
echo "Done!"
