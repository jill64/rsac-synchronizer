import core from '@actions/core'
import github from '@actions/github'
import { attempt } from '@jill64/attempt'
import { readFile } from 'fs/promises'
import merge from 'lodash/merge.js'
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
    rootConfig || repoConfig ? merge({}, rootConfig, repoConfig) : null

  const isConfig = scanner({})

  if (!isConfig(config)) {
    return
  }

  const rsac_token = core.getInput('rsac_token')

  if (repo === '.github' && rsac_token) {
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo
    })

    const { data: allRepo } =
      repository.owner.type !== 'Organization'
        ? await octokit.rest.repos.listForUser({
            username: owner
          })
        : await octokit.rest.repos.listForOrg({
            org: owner
          })

    const rsac_kit = github.getOctokit(rsac_token)

    const result = allRepo.map((repo) =>
      rsac_kit.rest.actions.createWorkflowDispatch({
        owner: 'jill64',
        repo: 'rsac-synchronizer',
        workflow_id: 'synchronize.yml',
        ref: 'main',
        inputs: {
          token,
          owner: repo.owner.login,
          repo: repo.name,
          ref: repo.default_branch,
          // Prevent Recursive Loop
          rsac_token: ''
        }
      })
    )

    await Promise.all(result)

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
