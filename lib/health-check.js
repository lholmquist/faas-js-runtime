'use strict';

const protection = require('overload-protection');

// Default LIVENESS/READINESS urls
const READINESS_URL = '/health/readiness';
const LIVENESS_URL = '/health/liveness';

// Configure protect for liveness/readiness probes
const protectCfg = {
  production: process.env.NODE_ENV === 'production',
  maxHeapUsedBytes: 0, // Max heap used threshold (0 to disable) [default 0]
  maxRssBytes: 0, // Max rss size threshold (0 to disable) [default 0]
  errorPropagationMode: false // Don't propagate error
};

const readinessURL = process.env.READINESS_URL || READINESS_URL;
const livenessURL = process.env.LIVENESS_URL || LIVENESS_URL;
const protect = protection('http', protectCfg);

function callProtect(request, reply) {
  console.log('Calling healthchecks');
  reply.header('Content-Type', 'text/plain; charset=utf8');
  protect(request, reply, _ => reply.send('OK'));
}

//TODO: pass the health/liveness functions here to get registered
module.exports = function use(fastify, options, done) {
  console.log('inside the health check export function', options);
  fastify.get(readinessURL, { logLevel: 'warn' }, options.options.readiness || callProtect);
  fastify.get(livenessURL, { logLevel: 'warn' }, options.options.liveness || callProtect);
  done();
};
