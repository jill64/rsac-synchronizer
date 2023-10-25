import { Octokit } from 'octoflare/octokit'
import yaml from 'yaml'
import { Buffer } from 'node:buffer'

export const getConfig = async ({
  owner,
  repo,
  octokit
}: {
  owner: string
  repo: string
  octokit: Octokit
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

    const str = Buffer.from(data.content, data.encoding).toString()

    return str ? (yaml.parse(str) as unknown) : null
  } catch (error) {
    console.error(error)
    return null
  }
}
