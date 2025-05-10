interface Config {
  SOCKET_URL: string;
  API_BASE_URL: string;
}

const development: Config = {
  SOCKET_URL: 'http://localhost:3001',
  API_BASE_URL: '/api',
};

const production: Config = {
  SOCKET_URL: 'https://newzai-382g.vercel.app',
  API_BASE_URL: 'https://newzai-382g.vercel.app/api',
};

const config: Config = process.env.NODE_ENV === 'production' ? production : development;

export default config; 