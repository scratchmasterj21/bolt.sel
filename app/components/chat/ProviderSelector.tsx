import { useStore } from '@nanostores/react';
import { atom } from 'nanostores';
import { useCallback } from 'react';
import type { Provider } from '~/lib/.server/llm/api-key';

// Store for the selected provider
export const providerStore = atom<Provider>('anthropic');

interface ProviderOption {
  id: Provider;
  name: string;
  description: string;
  icon: string;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s most capable model',
    icon: 'i-ph:robot-bold',
  },
  {
    id: 'google',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Google\'s cost-efficient model',
    icon: 'i-ph:sparkle-bold',
  },
];

export function ProviderSelector() {
  const selectedProvider = useStore(providerStore);

  const handleProviderChange = useCallback((provider: Provider) => {
    providerStore.set(provider);
  }, []);

  return (
    <div className="flex items-center gap-2 p-2 bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor">
      <span className="text-sm text-bolt-elements-textSecondary">AI Model:</span>
      <div className="flex gap-1">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderChange(provider.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${selectedProvider === provider.id
                ? 'bg-bolt-elements-accent text-bolt-elements-accent-foreground'
                : 'bg-transparent text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3 hover:text-bolt-elements-textPrimary'
              }
            `}
            title={provider.description}
          >
            <div className={`${provider.icon} text-base`} />
            <span className="hidden sm:inline">{provider.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
