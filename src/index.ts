import { octoflare } from 'octoflare'
import { applyConfig } from '../lib/applyConfig.js'
import { getConfig } from '../lib/getConfig.js'
import { mergeConfig } from '../lib/mergeConfig.js'
import { onCreateRepo } from './trigger/onCreateRepo.js'
import { onPush } from './trigger/onPush.js'

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

  const checkRun =
    'after' in payload
      ? await installation.createCheckRun({
          owner,
          repo,
          name: 'Repository Setting Synchronize',
          head_sha: payload.after
        })
      : null

  if (repo !== '.github') {
    const [rootConfig, repoConfig] = await Promise.all([
      getConfig({
        owner,
        repo: '.github',
        octokit
      }),
      getConfig({
        owner,
        repo,
        octokit
      })
    ])

    await applyConfig({
      octokit,
      owner,
      repo,
      config: mergeConfig(rootConfig, repoConfig)
    })

    return checkRun
      ? 'success'
      : new Response('Complete Synchronize', {
          status: 200
        })
  }

  await (checkRun?.dispatchWorkflow() ??
    installation.startWorkflow({
      payload: {
        owner,
        repo
      }
    }))

  return new Response('Dispatch Workflow: Synchronize All Repo', {
    status: 202
  })
})
