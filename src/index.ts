import { engines } from 'search-engine-collection'
import * as vscode from 'vscode'
import { google } from './google'

interface SearchProvider {
  icon?: vscode.Uri | vscode.ThemeIcon
  name: string
  url: string
}

interface SearchItem extends vscode.QuickPickItem {
  provider: SearchProvider
}

function search(value: string, provider: SearchProvider) {
  vscode.env.openExternal(vscode.Uri.parse(provider.url + encodeURIComponent(value)))
}

export async function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'fast-search.search',
    async () => {
      const searchProviders: SearchProvider[] = await Promise.all(engines.map(
        async engine => ({
          icon: new vscode.ThemeIcon('browser'),
          name: engine.name,
          url: engine.url,
        }),
      ))

      const ProviderQuickPickItems: SearchItem[] = searchProviders.map((provider) => {
        return {
          iconPath: provider.icon ?? new vscode.ThemeIcon('browser'),
          label: provider.name,
          provider,
        }
      })
      const quickPick = vscode.window.createQuickPick<SearchItem>()
      quickPick.placeholder = 'Search in Google or select a provider ...'
      quickPick.items = ProviderQuickPickItems
      quickPick.onDidAccept(async () => {
        const activeSearchItem = quickPick.activeItems[0]
        if (!activeSearchItem) {
          search(quickPick.value, google)
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
