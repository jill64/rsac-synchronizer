import { Octokit } from 'octoflare/octokit'
import { getFile } from './getFile.js'

export const getDirFiles = async ({
  octokit,
  repo,
  owner,
  path,
  ref
}: {
  octokit: Octokit
  repo: string
  owner: string
  path: string
  ref: string
}): Promise<(string | null)[]> => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
    })

    if (!Array.isArray(data)) {
      return []
    }

    const results = data.map(({ path }) =>
      getFile({
        octokit,
        repo,
        owner,
        path,
        ref
      })
    )

    return await Promise.all(results)
  } catch (e) {
    console.error(e)
    return []
  }
}
