export const joinParams = (params: Record<string, string>) => {
  const keys = Object.keys(params)
  if (keys.length === 0) {
    return ''
  }
  return '?' + keys.map((key) => `${key}=${params[key]}`).join('&')
}
