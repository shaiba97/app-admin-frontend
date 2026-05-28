const fs = require('fs');
const apiUrl = process.env.API_URL;

if (!apiUrl) {
  console.log('[set-env] No API_URL set, using existing environment.prod.ts');
  process.exit(0);
}

const wsUrl = apiUrl.replace(/\/api$/, '');
const env = `export const environment = {
  production: true,
  apiUrl: {
    admin:    '${apiUrl}',
    company:  '${apiUrl}',
    customer: '${apiUrl}',
  },
  wsUrl: '${wsUrl}',
};
`;

fs.writeFileSync('src/environments/environment.prod.ts', env);
console.log(`[set-env] API_URL=${apiUrl}`);
