import core from '@actions/core'
import github from '@actions/github'
import { attempt } from '@jill64/attempt'
import { readFile } from 'fs/promises'
import { array, scanner, string } from 'typescanner'
import yaml from 'yaml'
import { updateBranchProtection } from './updateBranchProtection.js'

export const main = async () => {
  const token = core.getInput('token')
  const octokit = github.getOctokit(token)

  const owner = core.getInput('owner')
  const repo = core.getInput('repo')

  const rootYml = core.getInput('root-config')

  const rootConfig = await attempt(async () => {
    const buff = await readFile(rootYml)
    const str = buff.toString()
    return yaml.parse(str) as unknown
  }, null)

  const repoConfig = await attempt(async () => {
    const buff = await readFile('rsac.yml')
    const str = buff.toString()
    return yaml.parse(str) as unknown
  }, null)

  const config =
    rootConfig || repoConfig
      ? {
          ...(rootConfig ?? {}),
          ...(repoConfig ?? {})
        }
      : null

  const isConfig = scanner({})

  if (!isConfig(config)) {
    return
  }

  const existRepository = scanner({
    repository: scanner({})
  })

  if (existRepository(config)) {
    await octokit.rest.repos.update({
      owner,
      repo,
      ...config.repository
    })
  }

  const existBranchProtection = scanner({
    'branch-protection': scanner({})
  })

  if (existBranchProtection(config)) {
    updateBranchProtection({
      octokit,
      owner,
      repo,
      protections: config['branch-protection']
    })
  }

  const existTopics = scanner({
    topics: array(string)
  })

  if (existTopics(config)) {
    await octokit.rest.repos.replaceAllTopics({
      owner,
      repo,
      names: config.topics
    })
  }
}
