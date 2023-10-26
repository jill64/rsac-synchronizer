import { action } from 'octoflare/action'
import { applyConfig } from '../../lib/applyConfig.js'
import { getConfig } from '../../lib/getConfig.js'
import { mergeConfig } from '../../lib/mergeConfig.js'

action(async ({ octokit, payload: { owner, repo } }) => {
  const [rootConfig, { data: repository }] = await Promise.all([
    getConfig({
      owner,
      repo: '.github',
      octokit
    }),
    octokit.rest.repos.get({
      owner,
      repo
    })
  ])

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
      octokit,
      owner: repo.owner.login,
      repo: repo.name,
      config: mergeConfig(rootConfig, repoConfig)
    })
  })

  await Promise.all(result)
})
