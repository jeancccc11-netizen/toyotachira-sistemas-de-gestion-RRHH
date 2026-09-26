module.exports = {
  apps: [
    {
      name: 'sighr-backend',
      script: 'src/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      time: true,
    },
  ],
};
