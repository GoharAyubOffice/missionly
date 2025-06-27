// Re-export client and server configs for convenience
export { clientConfig, type ClientConfig } from './config/client';
export { serverConfig, type ServerConfig } from './config/server';

// Backward compatibility
export const getPublicConfig = () => {
  const { clientConfig } = require('./config/client');
  return clientConfig;
};

export const getServerConfig = () => {
  const { serverConfig } = require('./config/server');
  return serverConfig;
};