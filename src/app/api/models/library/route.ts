import { NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

interface LibraryModel {
  name: string;
  description: string;
  parameterSizes: string[];
  capabilities: string[];
  pullCount: string;
  tagCount: string;
  lastUpdated: string;
}

export async function GET() {
  try {
    const response = await fetch('https://ollama.com/library', {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models from library');
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const models: LibraryModel[] = [];
    const modelElements = document.querySelectorAll('li[x-test-model]');

    modelElements.forEach((modelElement) => {
      const name = modelElement.querySelector('[x-test-model-title]')?.getAttribute('title') || '';
      const description = modelElement.querySelector('.text-neutral-800')?.textContent?.trim() || '';
      
      const parameterSizes: string[] = [];
      modelElement.querySelectorAll('[x-test-size]').forEach((sizeElement) => {
        parameterSizes.push(sizeElement.textContent?.trim() || '');
      });

      const capabilities: string[] = [];
      modelElement.querySelectorAll('[x-test-capability]').forEach((capElement) => {
        capabilities.push(capElement.textContent?.trim() || '');
      });

      const pullCount = modelElement.querySelector('[x-test-pull-count]')?.textContent?.trim() || '0';
      const tagCount = modelElement.querySelector('[x-test-tag-count]')?.textContent?.trim() || '0';
      const lastUpdated = modelElement.querySelector('[x-test-updated]')?.textContent?.trim() || '';

      models.push({
        name,
        description,
        parameterSizes,
        capabilities,
        pullCount,
        tagCount,
        lastUpdated,
      });
    });

    return NextResponse.json({ models });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 