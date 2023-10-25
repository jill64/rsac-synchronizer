import { action } from 'octoflare/action'
import { applyConfig } from '../../lib/applyConfig.js'
import { getConfig } from '../../lib/getConfig.js'
import { mergeConfig } from '../../lib/mergeConfig.js'

action(async ({ octokit, payload: { owner, repo } }) => {
  const rootConfig = await getConfig({
    owner,
    repo: '.github',
    octokit
  })

    console.log('root', rootConfig)

  const { data: repository } = await octokit.rest.repos.get({
    owner,
    repo
  })

  const { data: allRepo } = await (repository.owner.type !== 'Organization'
    ? octokit.rest.repos.listForUser({
        username: owner
      })
    : octokit.rest.repos.listForOrg({
        org: owner
      }))

  const result = allRepo.map(async (repo) => {
    const repoConfig = await getConfig({
      owner: repo.owner.login,
      repo: repo.name,
      octokit
    })
    
    console.log(repo.name, 'repoConfig', repoConfig)
    console.log(repo.name, 'mergeConfig',  mergeConfig(rootConfig, repoConfig))

    await applyConfig({
      octokit,
      owner: repo.owner.login,
      repo: repo.name,
      config: mergeConfig(rootConfig, repoConfig)
    })
  })

  await Promise.all(result)
})
