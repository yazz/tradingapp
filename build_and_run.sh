pkill -9 -f zalgo_server
bun build ./server.js --compile --outfile zalgo_server
./zalgo_server&
node index.js