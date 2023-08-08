import * as vscode from 'vscode'
import * as icon from './icon'

interface SearchProvider {
  icon?: string
  name: string
  template: string
}

const searchProviders: SearchProvider[] = [
  {
    icon: icon.google,
    name: 'Google',
    template: 'https://www.google.com/search?q={{q}}',
  },
  {
    icon: icon.github,
    name: 'Github',
    template: 'https://github.com/search?q={{q}}&ref=opensearch',
  },
  {
    icon: icon.npmjs,
    name: 'npmjs',
    template: 'https://www.npmjs.com/search?q={{q}}',
  },
]

const ProviderQuickPickItems: SearchItem[] = searchProviders.map((provider) => {
  return {
    iconPath: provider.icon ? vscode.Uri.parse(provider.icon) : new vscode.ThemeIcon('browser'),
    label: provider.name,
    provider,
  }
})

interface SearchItem extends vscode.QuickPickItem {
  provider: SearchProvider
}

function search(value: string, provider: SearchProvider) {
  const url = provider.template.replace(/{{q}}/g, encodeURIComponent(value))
  vscode.env.openExternal(vscode.Uri.parse(url))
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'fast-search.search',
    async () => {
      const quickPick = vscode.window.createQuickPick<SearchItem>()
      quickPick.placeholder = 'Search in Google or select a provider ...'
      quickPick.items = ProviderQuickPickItems
      quickPick.onDidAccept(async () => {
        const activeSearchItem = quickPick.activeItems[0]
        if (!activeSearchItem) {
          search(quickPick.value, searchProviders[0])
        }
        else {
          const value = await vscode.window.showInputBox({
            placeHolder: `Search in ${activeSearchItem.provider.name}`,
          })
          if (value)
            search(value, activeSearchItem.provider)
        }
        quickPick.dispose()
      })
      quickPick.show()
    },
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
