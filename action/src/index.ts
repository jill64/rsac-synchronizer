import { action } from 'octoflare/action'
import { applyConfig } from './utils/applyConfig.js'
import { getConfig } from './utils/getComfig.js'
import { mergeConfig } from './utils/mergeConfig.js'

action(async ({ octokit, appkit, payload: { repo, owner } }) => {
  const rootConfig = await getConfig({
    owner,
    repo: '.github',
    octokit
  })

  if (repo !== '.github') {
    const repoConfig = await getConfig({
      owner,
      repo,
      octokit
    })

    await applyConfig({
      octokit,
      owner,
      repo,
      config: mergeConfig(rootConfig, repoConfig)
    })

    return
  }

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

    await applyConfig({
      octokit: appkit,
      owner: repo.owner.login,
      repo: repo.name,
      config: mergeConfig(rootConfig, repoConfig)
    })
  })

  await Promise.all(result)
})
