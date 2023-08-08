import * as vscode from 'vscode'

function searchGoogle(input: string) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(input)}`
  vscode.env.openExternal(vscode.Uri.parse(url))
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'quick-search.search',
    async () => {
      const input = await vscode.window.showInputBox({
        placeHolder: 'Search in Google',
      })
      if (input)
        searchGoogle(input)
    },
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
