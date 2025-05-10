interface Config {
  SOCKET_URL: string;
  API_BASE_URL: string;
  SOCKET_OPTIONS: {
    path: string;
    transports: string[];
    withCredentials: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    timeout: number;
    secure: boolean;
    autoConnect: boolean;
    forceNew: boolean;
  };
}

const development: Config = {
  SOCKET_URL: 'http://localhost:3001',
  API_BASE_URL: '/api',
  SOCKET_OPTIONS: {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    secure: false,
    autoConnect: false,
    forceNew: true
  }
};

const production: Config = {
  SOCKET_URL: 'https://newzai-382g.vercel.app',
  API_BASE_URL: 'https://newzai-382g.vercel.app',
  SOCKET_OPTIONS: {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    secure: true,
    autoConnect: false,
    forceNew: true
  }
};

const config: Config = process.env.NODE_ENV === 'production' ? production : development;

export default config; 