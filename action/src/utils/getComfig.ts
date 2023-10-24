import { ActionOctokit } from 'octoflare/action'
import yaml from 'yaml'

export const getConfig = async ({
  owner,
  repo,
  octokit
}: {
  owner: string
  repo: string
  octokit: ActionOctokit
}) => {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: 'rsac.yml'
    })

    if (!('type' in data && data.type === 'file')) {
      return null
    }

    const str =
      data.encoding === 'base64'
        ? Buffer.from(data.content, 'base64').toString()
        : data.content

    return str ? (yaml.parse(str) as unknown) : null
  } catch (error) {
    console.error(error)
    return null
  }
}
