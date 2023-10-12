import { unfurl } from '@jill64/unfurl'
import { octoflare } from 'octoflare'
import { onCreateRepo } from './onCreateRepo.js'
import { onPush } from './onPush.js'

export default octoflare(async ({ app, installation, payload }) => {
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

  const { owner, repo, ref } = event

  const {
    data: { id: installation_id }
  } = await app.octokit.rest.apps.getRepoInstallation({
    owner: 'jill64',
    repo: 'rsac-synchronizer'
  })

  const { octokit, rsac_token } = await unfurl({
    octokit: app.getInstallationOctokit(installation_id),
    rsac_token:
      repo === '.github'
        ? app.octokit.rest.apps
            .createInstallationAccessToken({
              installation_id
            })
            .then(({ data }) => data.token)
        : ''
  })

  await octokit.rest.actions.createWorkflowDispatch({
    owner: 'jill64',
    repo: 'rsac-synchronizer',
    workflow_id: 'synchronize.yml',
    ref: 'main',
    inputs: {
      token: installation.token,
      rsac_token,
      owner,
      repo,
      ref
    }
  })

  return new Response(null, {
    status: 202
  })
})
