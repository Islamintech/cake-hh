import { loadConfig, assertConfig } from './config/index.js';
import { openDatabase } from './models/database.js';
import { createOrderEvents } from './services/orderEvents.js';
import { createSuggester } from './services/suggestionService.js';
import { createApp } from './app.js';

const config = loadConfig();
const problems = assertConfig(config);
if (problems.length) {
  console.error('Config errors:\n - ' + problems.join('\n - '));
  process.exit(1);
}

const db = openDatabase(config.dbPath);
const suggester = createSuggester(config);
const app = createApp({ db, events: createOrderEvents(), config, suggester });

const server = app.listen(config.port, config.host, () => {
  console.log(`Cake Kitchen API on http://localhost:${config.port}  (db: ${config.dbPath}, ai: ${suggester.enabled ? `${suggester.provider} ${suggester.model}` : 'local recipes'})`);
  if (config.usingDevKeys) {
    console.log('Dev bakery keys in use (set ADMIN_KEY / BAKERY_KEYS to override):');
    console.log(`  admin: ${config.adminKey}`);
    for (const [id, k] of Object.entries(config.bakeryKeys)) console.log(`  ${id}: ${k}`);
  }
});

// SSE connections stay open; don't let them hold the process on shutdown.
function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, shutting down`);
  server.close(() => { db.close(); process.exit(0); });
  server.closeAllConnections();
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
