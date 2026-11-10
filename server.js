/* Entry file for hosts that start the app from the project root
   (Hostinger Node.js Web Apps: Application type "express", Entry file "server.js"). */
require('./server/src/index.js').bootstrap().catch(e => { console.error(e); process.exit(1); });
