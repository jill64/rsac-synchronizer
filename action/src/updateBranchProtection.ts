import github from '@actions/github'
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
