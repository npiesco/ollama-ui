// /ollama-ui/src/__tests__/deploy.test.ts
import { spawn } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as http from 'http';
import * as os from 'os';

jest.setTimeout(10000); // Reduce timeout to 10 seconds

// Base test environment
const baseTestEnv = {
  PYTHONPATH: process.cwd(),
  VIRTUAL_ENV: join(process.cwd(), 'venv'),
  PATH: `${join(process.cwd(), 'venv/bin')}:${process.env.PATH}`,
  SKIP_HEALTH_CHECK: 'true',
  SKIP_DOCKER_COMMANDS: 'true'
};

describe('Deployment Script', () => {
  const envPath = join(process.cwd(), '.env');
  const envExamplePath = join(process.cwd(), '.env.example');
  const backupEnvPath = join(process.cwd(), '.env.backup');
  const tempDockerEnvPath = join(os.tmpdir(), '.dockerenv');
  let mockOllamaServer: http.Server;
  let mockHealthServer: http.Server;

  // Create mock .env.example if it doesn't exist
  beforeAll((done) => {
    // Create mock .env.example
    const exampleContent = `
# Required Configuration
OLLAMA_API_HOST=http://localhost:11434
NODE_ENV=production

# Authentication
AUTH_ENABLED=true
JWT_SECRET=change-this-to-a-secure-secret-key
    `.trim();
    writeFileSync(envExamplePath, exampleContent);

    // Setup mock servers
    mockOllamaServer = http.createServer((req, res) => {
      if (req.url === '/api/version') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ version: '0.1.0' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    }).listen(11434, 'localhost');

    mockHealthServer = http.createServer((req, res) => {
      if (req.url === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'healthy' }));
      } else {
        res.writeHead(404);
        res.end();
      }
    }).listen(3000, 'localhost', done);
  });

  afterAll((done) => {
    // Cleanup
    if (existsSync(envExamplePath)) {
      unlinkSync(envExamplePath);
    }
    if (existsSync(tempDockerEnvPath)) {
      unlinkSync(tempDockerEnvPath);
    }
    mockOllamaServer.close(() => {
      mockHealthServer.close(done);
    });
  });

  // Backup existing .env if it exists
  beforeEach(() => {
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8');
      writeFileSync(backupEnvPath, content, 'utf-8');
      unlinkSync(envPath);
    }
  });

  // Restore .env backup if it exists
  afterEach(() => {
    if (existsSync(backupEnvPath)) {
      const content = readFileSync(backupEnvPath, 'utf-8');
      writeFileSync(envPath, content, 'utf-8');
      unlinkSync(backupEnvPath);
    }
    if (existsSync(envPath)) {
      unlinkSync(envPath);
    }
  });

  const runDeployScript = async (args: string[], env: NodeJS.ProcessEnv = {}): Promise<{
    exitCode: number;
    output: string;
  }> => {
    const deployProcess = spawn('python3', ['deploy.py', ...args], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        ...baseTestEnv,
        ...env 
      }
    });

    let output = '';
    deployProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    deployProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    const exitCode = await new Promise<number>((resolve) => {
      deployProcess.on('close', resolve);
    });

    return { exitCode, output };
  };

  describe('Local Environment', () => {
    it('should create .env file with local configuration', async () => {
      const { exitCode } = await runDeployScript(['--environment', 'local'], {
        MOCK_COMMANDS: 'curl,python3'
      });

      expect(exitCode).toBe(0);
      expect(existsSync(envPath)).toBe(true);

      const envContent = readFileSync(envPath, 'utf-8');
      expect(envContent).toContain('OLLAMA_API_HOST=http://localhost:11434');
      expect(envContent).toContain('NODE_ENV=production');
      expect(envContent).toContain('AUTH_ENABLED=true');
      expect(envContent).toContain('JWT_SECRET=');
      expect(envContent).not.toContain('change-this-to-a-secure-secret-key');
    });

    it('should fail if Ollama is not running locally', async () => {
      // Make Ollama return an error response
      mockOllamaServer.removeAllListeners('request');
      mockOllamaServer.on('request', (req, res) => {
        res.writeHead(500);
        res.end();
      });

      const { exitCode, output } = await runDeployScript(['--environment', 'local'], {
        MOCK_COMMANDS: 'curl,python3'
      });

      expect(exitCode).not.toBe(0);
      expect(output).toContain('Error: Ollama is not running locally');

      // Restore original handler
      mockOllamaServer.removeAllListeners('request');
      mockOllamaServer.on('request', (req, res) => {
        if (req.url === '/api/version') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ version: '0.1.0' }));
        } else {
          res.writeHead(404);
          res.end();
        }
      });
    });
  });

  describe('Docker Environment', () => {
    it('should create .env file with Docker configuration', async () => {
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
      writeFileSync(tempDockerEnvPath, '');

      const { exitCode, output } = await runDeployScript([], {
        MOCK_COMMANDS: 'docker,docker-compose,curl',
        MOCK_DOCKERENV_PATH: tempDockerEnvPath
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