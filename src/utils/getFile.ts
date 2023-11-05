import { Buffer } from 'node:buffer'
import { Octokit } from 'octoflare/octokit'

export const getFile = async ({
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
}) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref
    })

    if (!('type' in data && data.type === 'file')) {
      return null
    }

    const str =
      data.encoding === 'base64'
        ? Buffer.from(data.content, 'base64').toString()
        : data.content

    return str
  } catch (e) {
    console.error(e)
    return null
  }
}
