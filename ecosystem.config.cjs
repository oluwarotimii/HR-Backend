module.exports = {
  apps: [
    {
      name: 'hr-backend',
      cwd: __dirname,
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      exp_backoff_restart_delay: 200,
      max_memory_restart: '750M',
      node_args: '--enable-source-maps',
      listen_timeout: 10000,
      kill_timeout: 15000,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

