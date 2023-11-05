import { array, optional, scanner, string } from 'typescanner'

type Job =
  | {
      uses: string
    }
  | {
      'runs-on': string
      strategy?: {
        matrix: {
          [key: string]: string[]
        }
      }
    }

const isReusable = scanner({
  uses: string
})

const isStrategy = scanner({
  'runs-on': string,
  strategy: optional(
    scanner({
      matrix: optional(
        (x: unknown): x is Record<string, string[]> =>
          scanner({})(x) && Object.values(x).every(array(string))
      )
    })
  )
})

export const isValidWorkflow = scanner({
  on: (x: unknown): x is Record<string, unknown> | string =>
    scanner({})(x) || string(x),
  jobs: (x: unknown): x is Record<string, Job> =>
    scanner({})(x) &&
    Object.values(x).every((x) => isReusable(x) || isStrategy(x))
})
