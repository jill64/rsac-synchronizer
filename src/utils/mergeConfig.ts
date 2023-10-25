import mergeWith from 'lodash/mergeWith.js'

export const mergeConfig = (rootConfig: unknown, repoConfig: unknown) =>
  rootConfig || repoConfig
    ? mergeWith({}, rootConfig, repoConfig, (a: unknown, b: unknown) => {
        if (Array.isArray(a) && Array.isArray(b)) {
          return [...new Set([...a, ...b])]
        }
      })
    : null
