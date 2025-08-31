module.exports = {
  apps: [
    {
      name: 'fixly-auth-app',
      script: 'app-server.js',
      cwd: '/home/user/webapp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 8080
      },
      log_file: './logs/app.log',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      time: true
    }
  ]
};