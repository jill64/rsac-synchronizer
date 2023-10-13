import { action } from 'octoflare/action'
import { isBranchProtection } from './isBranchProtection.js'

export const updateBranchProtection = async ({
  protections,
  octokit,
  owner,
  repo
}: {
  protections: Record<string, unknown>
  octokit: Parameters<Parameters<typeof action>[0]>[0]['octokit']
  owner: string
  repo: string
}) => {
  const branches = Object.keys(protections)

  const result = branches.map(async (branch) => {
    const conf = protections[branch]

    if (!isBranchProtection(conf)) {
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
