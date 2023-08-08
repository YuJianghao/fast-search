import engines from 'search-engine-collection'
import * as vscode from 'vscode'
import { getDataUrl } from './icon'

interface SearchProvider {
  icon?: string
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
  async function getIcon(icon: string) {
    const key = `icon-${icon}`
    if (!context.globalState.get(key)) {
      const data = await getDataUrl(icon)
      await context.globalState.update(key, data)
    }
    return await context.globalState.get(key) as string
  }

  // preload icons
  engines.forEach(engine => getIcon(engine.icon))

  const disposable = vscode.commands.registerCommand(
    'fast-search.search',
    async () => {
      const searchProviders: SearchProvider[] = await Promise.all(engines.map(
        async engine => ({
          icon: await getIcon(engine.icon),
          name: engine.name,
          url: engine.url,
        }),
      ))

      const ProviderQuickPickItems: SearchItem[] = searchProviders.map((provider) => {
        return {
          iconPath: provider.icon ? vscode.Uri.parse(provider.icon) : new vscode.ThemeIcon('browser'),
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
