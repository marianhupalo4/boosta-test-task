import { execSync } from 'node:child_process';
import { TEST_ENV } from './test-env';

/** Brings the test database to the latest schema and seeds quiz versions. */
export default function globalSetup() {
  const options = {
    cwd: `${__dirname}/..`,
    env: { ...process.env, ...TEST_ENV },
    stdio: 'pipe' as const,
  };
  execSync('npx prisma migrate deploy', options);
  execSync('npx prisma db seed', options);
}
