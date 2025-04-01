import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { access } from 'fs/promises';
import { config } from '@/lib/config';

const execAsync = promisify(exec);

async function checkOllamaInstallation(): Promise<{
  isApp: boolean;
  isHomebrew: boolean;
  isCask: boolean;
  path?: string;
}> {
  console.log('Checking Ollama installation...');
  try {
    // Check for Ollama.app
    try {
      await access('/Applications/Ollama.app');
      console.log('Found Ollama.app in /Applications');

      // Check if it's a cask installation
      try {
        await execAsync('brew list --cask ollama');
        console.log('Found Ollama installed via Homebrew Cask');
        return { isApp: true, isHomebrew: false, isCask: true, path: '/Applications/Ollama.app' };
      } catch {
        console.log('Ollama.app is not from Homebrew Cask');
        return { isApp: true, isHomebrew: false, isCask: false, path: '/Applications/Ollama.app' };
      }
    } catch {
      console.log('Ollama.app not found in /Applications');
    }

    // Check for Homebrew formula installation
    try {
      const { stdout } = await execAsync('brew list ollama');
      console.log('Found Ollama installed via Homebrew formula:', stdout);
      return { isApp: false, isHomebrew: true, isCask: false };
    } catch {
      console.log('Ollama not found in Homebrew formula');
    }

    // Check for binary in common locations
    for (const path of ['/usr/local/bin/ollama', '/usr/bin/ollama']) {
      try {
        await access(path);
        console.log('Found Ollama binary at:', path);
        return { isApp: false, isHomebrew: false, isCask: false, path };
      } catch {
        console.log('Ollama binary not found at:', path);
      }
    }

    return { isApp: false, isHomebrew: false, isCask: false };
  } catch (error) {
    console.error('Error checking Ollama installation:', error);
    return { isApp: false, isHomebrew: false, isCask: false };
  }
}

export async function POST() {
  try {
    console.group('Ollama Update Process');

    // Check current version
    console.log('Checking current version...');
    const versionResponse = await fetch(`${config.OLLAMA_API_HOST}/api/version`);
    if (!versionResponse.ok) {
      console.error('Failed to check current version:', versionResponse.statusText);
      console.groupEnd();
      return NextResponse.json({ error: 'Failed to check current version' }, { status: 500 });
    }

    const versionData = await versionResponse.json();
    console.log('Current version:', versionData.version);

    // Get latest version from GitHub
    console.log('Fetching latest version from GitHub...');
    const githubResponse = await fetch('https://api.github.com/repos/ollama/ollama/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Ollama-UI',
      },
    });

    if (!githubResponse.ok) {
      console.error('Failed to check latest version:', githubResponse.statusText);
      console.groupEnd();
      return NextResponse.json({ error: 'Failed to check latest version' }, { status: 500 });
    }

    const githubData = await githubResponse.json();
    const latestVersion = githubData.tag_name.replace('v', '');
    console.log('Latest version:', latestVersion);

    if (versionData.version === latestVersion) {
      console.log('Already up to date');
      console.groupEnd();
      return NextResponse.json({ success: true, message: 'Already up to date' });
    }

    // Check how Ollama is installed
    const installation = await checkOllamaInstallation();
    console.log('Installation details:', installation);

    // Return update information
    console.groupEnd();
    return NextResponse.json({
      needsUpdate: true,
      currentVersion: versionData.version,
      latestVersion,
      installation,
    });
  } catch (error) {
    console.error('Error during update check:', error);
    console.groupEnd();
    return NextResponse.json({
      error: 'Failed to check for updates',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
