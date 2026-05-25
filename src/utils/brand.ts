export const extractBrandFromName = (name: string): string => {
  const lowercase = name.toLowerCase()
  if (lowercase.includes('petrobras') || lowercase.includes('br')) return 'Petrobras'
  if (lowercase.includes('ipiranga')) return 'Ipiranga'
  if (lowercase.includes('shell')) return 'Shell'
  if (lowercase.includes('ale')) return 'Ale'
  return 'Outra'
}
