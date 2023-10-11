import github from '@actions/github'
import { Null, array, boolean, scanner, string, union } from 'typescanner'
import { isBranchProtection } from './isBranchProtection.js'

export const updateBranchProtection = async ({
  protections,
  octokit,
  owner,
  repo
}: {
  protections: Record<string, unknown>
  octokit: ReturnType<typeof github.getOctokit>
  owner: string
  repo: string
}) => {
  const branches = Object.keys(protections)

  const result = branches.map(async (branch) => {
    const conf = protections[branch]

    console.log('branch-protection', branch, conf)

    if (!isBranchProtection(conf)) {
      console.log('not match', branch, conf)
      const required_status_checks = union(
        scanner({
          strict: boolean,
          contexts: array(string)
        }),
        Null
      )

      if (
        conf &&
        typeof conf === 'object' &&
        'required_status_checks' in conf
      ) {
        console.log(
          'is_required_status_checks',
          required_status_checks(conf.required_status_checks)
        )
      }
      return
    }

    await octokit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch,
      ...conf
    })
  })

  await Promise.all(result)
}
