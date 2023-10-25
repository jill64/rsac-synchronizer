import { octoflare } from 'octoflare'
import { onCreateRepo } from './trigger/onCreateRepo.js'
import { onPush } from './trigger/onPush.js'
import { applyConfig } from './utils/applyConfig.js'
import { getConfig } from './utils/getConfig.js'
import { mergeConfig } from './utils/mergeConfig.js'

export default octoflare(async ({ installation, payload }) => {
  const event = onPush(payload) ?? onCreateRepo(payload)

  if (!event) {
    return new Response('No Trigger Event', {
      status: 200
    })
  }

  if (!installation) {
    return new Response('No Installation', {
      status: 200
    })
  }

  const { owner, repo } = event
  const octokit = installation.kit

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

    return new Response('Complete Synchronize', {
      status: 200
    })
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
      octokit,
      owner: repo.owner.login,
      repo: repo.name,
      config: mergeConfig(rootConfig, repoConfig)
    })
  })

  await Promise.all(result)

  return new Response('Complete Synchronize for All Repo', {
    status: 200
  })
})
