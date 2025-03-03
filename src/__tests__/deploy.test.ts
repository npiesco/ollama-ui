// /ollama-ui/src/__tests__/deploy.test.ts
import { spawn } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';
import * as os from 'os';

jest.setTimeout(10000); // Set timeout to 10 seconds

// Base test environment
const baseTestEnv = {
  PYTHONPATH: process.cwd(),
  VIRTUAL_ENV: join(process.cwd(), 'venv'),
  PATH: `${join(process.cwd(), 'venv/bin')}:${process.env.PATH}`,
  SKIP_HEALTH_CHECK: 'true',
  SKIP_DOCKER_COMMANDS: 'true'
};

// Helper function to run the deploy script
async function runDeployScript(args: string[] = [], env: Record<string, string> = {}): Promise<{ exitCode: number; output: string }> {
  return new Promise((resolve) => {
    const childProcess = spawn('python3', [join(process.cwd(), 'deploy.py'), ...args], {
      env: { 
        ...process.env,
        ...baseTestEnv,
        ...env 
      },
      cwd: process.cwd()
    });

    let output = '';
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    childProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    childProcess.on('close', (code) => {
      resolve({ exitCode: code || 0, output });
    });
  });
}

describe('Deployment Script', () => {
  const originalEnv = process.env;
  const envPath = '.env';
  const envExamplePath = '.env.example';
  const dockerEnvPath = join(os.tmpdir(), '.dockerenv');
  const deployScriptPath = join(process.cwd(), 'deploy.py');

  beforeAll(() => {
    // Skip tests if deploy.py doesn't exist
    if (!existsSync(deployScriptPath)) {
      console.warn('deploy.py not found, skipping deployment tests');
      return;
    }

    // Create mock .env.example file
    writeFileSync(envExamplePath, 'OLLAMA_API_HOST=http://localhost:11434\n');
  });

  afterAll(() => {
    // Clean up mock files
    if (existsSync(envExamplePath)) {
      unlinkSync(envExamplePath);
    }
    if (existsSync(dockerEnvPath)) {
      unlinkSync(dockerEnvPath);
    }
  });

  beforeEach(() => {
    // Skip tests if deploy.py doesn't exist
    if (!existsSync(deployScriptPath)) {
      return;
    }

    // Reset environment before each test
    process.env = { ...originalEnv };
    // Backup existing .env file if it exists
    if (existsSync(envPath)) {
      renameSync(envPath, `${envPath}.bak`);
    }
  });

  afterEach(() => {
    // Skip cleanup if deploy.py doesn't exist
    if (!existsSync(deployScriptPath)) {
      return;
    }

    // Restore environment
    process.env = originalEnv;
    // Clean up test .env file
    if (existsSync(envPath)) {
      unlinkSync(envPath);
    }
    // Restore backed up .env file if it exists
    if (existsSync(`${envPath}.bak`)) {
      renameSync(`${envPath}.bak`, envPath);
    }
    // Clean up test dockerenv file
    if (existsSync(dockerEnvPath)) {
      unlinkSync(dockerEnvPath);
    }
  });

  describe('Local Environment', () => {
    it('should create .env file with local configuration', async () => {
      // Skip test if deploy.py doesn't exist
      if (!existsSync(deployScriptPath)) {
        console.warn('deploy.py not found, skipping test');
        return;
      }

      const { exitCode } = await runDeployScript(['--environment', 'local'], {
        MOCK_COMMANDS: 'curl,python3'
      });

      expect(exitCode).toBe(0);
      expect(existsSync(envPath)).toBe(true);
      const envContent = readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('OLLAMA_API_HOST=http://localhost:11434');
    }, 10000);

    // ... rest of the tests ...
  });

  describe('Docker Environment', () => {
    beforeEach(() => {
      // Create Docker-specific .env.example
      writeFileSync(envExamplePath, `OLLAMA_API_HOST=http://ollama:11434
NODE_ENV=production
AUTH_ENABLED=true
JWT_SECRET=test-secret-key
`);
    });

    it('should create .env file with Docker configuration', async () => {
      // Skip test if deploy.py doesn't exist
      if (!existsSync(deployScriptPath)) {
        console.warn('deploy.py not found, skipping test');
        return;
      }

      const { exitCode } = await runDeployScript(['--environment', 'docker'], {
        MOCK_COMMANDS: 'docker,docker-compose,curl'
      });

      expect(exitCode).toBe(0);
      expect(existsSync(envPath)).toBe(true);

      const envContent = readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('OLLAMA_API_HOST=http://ollama:11434');
      expect(envContent).toContain('NODE_ENV=production');
      expect(envContent).toContain('AUTH_ENABLED=true');
      expect(envContent).toContain('JWT_SECRET=');
      expect(envContent).not.toContain('change-this-to-a-secure-secret-key');
    });

    it('should detect Docker environment automatically', async () => {
      writeFileSync(dockerEnvPath, '');

      const { exitCode, output } = await runDeployScript([], {
        MOCK_COMMANDS: 'docker,docker-compose,curl',
        MOCK_DOCKERENV_PATH: dockerEnvPath
      });

      expect(exitCode).toBe(0);
      expect(output).toContain('Running inside Docker container');
      expect(output).toContain('Building and starting services');
    });
  });

  describe('Command Detection', () => {
    it('should check for required commands based on environment', async () => {
      // Test local environment (should only require curl)
      const { exitCode: localExitCode } = await runDeployScript(['--environment', 'local'], {
        MOCK_COMMANDS: 'curl,python3'
      });
      expect(localExitCode).toBe(0);

      // Test Docker environment (should require docker and docker-compose)
      const { exitCode: dockerExitCode, output: dockerOutput } = await runDeployScript(
        ['--environment', 'docker'],
        { MOCK_COMMANDS: 'curl' }  // Only mock curl, not docker or docker-compose
      );

      expect(dockerExitCode).not.toBe(0);
      expect(dockerOutput).toContain('Error: The following required commands are missing');
    });
  });
}); 