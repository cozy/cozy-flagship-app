/*
 * Looks for {{variable}} in a string and replaces it with the value of the variable.
 * If the variable is not found in the arguments, it will be replaced with the variable name.
 */
const regex = new RegExp('{{([^{]+)}}', 'g')

export const t = (
  template: string,
  variables: Record<string, string | undefined>
): string =>
  template.replace(regex, (_match, varName) => {
    if (typeof varName !== 'string') return ''

    const variable = variables[varName]

    if (typeof variable === 'undefined') return varName
    else return variable
  })
