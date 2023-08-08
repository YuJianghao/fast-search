import fetch from 'node-fetch'
import { buildIcon, loadIcon } from 'iconify-icon'
import Base64 from './base64'

const API_ENTRY = 'https://api.iconify.design'

export async function getSvgLocal(icon: string, size = '1em', color = 'currentColor') {
  const data = await loadIcon(icon)
  if (!data)
    return
  const built = buildIcon(data, { height: size })
  if (!built)
    return
  const xlink = built.body.includes('xlink:') ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : ''
  return `<svg xmlns="http://www.w3.org/2000/svg"${xlink} ${Object.entries(built.attributes).map(([k, v]) => `${k}="${v}"`).join(' ')}>${built.body}</svg>`.replaceAll('currentColor', color)
}

export async function getSvg(icon: string, size = '1em', color = 'currentColor') {
  return await getSvgLocal(icon, size, color)
   || await fetch(`${API_ENTRY}/${icon}.svg?inline=false&height=${size}&color=${encodeURIComponent(color)}`).then(r => r.text()) || ''
}

export async function getDataUrl(icon: string) {
  return `data:image/svg+xml;base64,${Base64.encode(await getSvg(icon, undefined))}`
}
