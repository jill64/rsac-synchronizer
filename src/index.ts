import { octoflare } from 'octoflare'
import { onCreateRepo } from './onCreateRepo.js'
import { onPush } from './onPush.js'

export default octoflare(async ({ app, installation, payload, env }) => {
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

  const rsac_token =
    repo === '.github'
      ? await app.octokit.rest.apps
          .getRepoInstallation({
            owner: env.OCTOFLARE_APP_OWNER,
            repo: env.OCTOFLARE_APP_REPO
          })
          .then(({ data: { id } }) =>
            app.octokit.rest.apps.createInstallationAccessToken({
              installation_id: id
            })
          )
          .then(({ data: { token } }) => token)
      : ''

  await installation.startWorkflow({
    payload: {
      owner,
      repo
    },
    rsac_token,
    ref
  })

  return new Response('RSaC Synchronize Workflow Dispatched', {
    status: 202
  })
})
