import { AzureOpenAI } from 'openai';

if (!process.env.AZURE_OPENAI_API_KEY) {
  throw new Error('Missing env.AZURE_OPENAI_API_KEY');
}
if (!process.env.AZURE_OPENAI_ENDPOINT) {
  throw new Error('Missing env.AZURE_OPENAI_ENDPOINT');
}
if (!process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
  throw new Error('Missing env.AZURE_OPENAI_DEPLOYMENT_NAME');
}

/**
 * Azure OpenAI client configuration
 */
const azureConfig = {
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
};

/**
 * Create and export Azure OpenAI client instance
 */
export const azureOpenAI = new AzureOpenAI({
  apiKey: azureConfig.apiKey,
  endpoint: azureConfig.endpoint,
  apiVersion: azureConfig.apiVersion,
  deployment: azureConfig.deployment,
});

/**
 * Get the deployment name for chat completions
 */
export function getDeploymentName(): string {
  return azureConfig.deployment;
}

/**
 * Create a new Azure OpenAI client instance
 * Useful for creating isolated clients with different configurations
 */
export function createAzureClient(overrides?: {
  apiKey?: string;
  endpoint?: string;
  deployment?: string;
}): AzureOpenAI {
  return new AzureOpenAI({
    apiKey: overrides?.apiKey || azureConfig.apiKey,
    endpoint: overrides?.endpoint || azureConfig.endpoint,
    apiVersion: azureConfig.apiVersion,
    deployment: overrides?.deployment || azureConfig.deployment,
  });
}
