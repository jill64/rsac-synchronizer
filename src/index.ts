import { octoflare } from 'octoflare'

export default octoflare(async ({ app, installation, payload }) => {
  if (!('commits' in payload)) {
    return new Response('No Push Event', {
      status: 200
    })
  }

  if (!installation) {
    return new Response('No Installation', {
      status: 200
    })
  }

  const { repository, commits } = payload

  const owner = repository.owner.login
  const repo = repository.name
  const ref = payload.ref.replace('refs/heads/', '')

  if (ref !== repository.default_branch) {
    return new Response('Base is not default branch', {
      status: 200
    })
  }

  const isTriggered = commits.some((commit) =>
    commit.modified.includes('rsac.yml')
  )

  if (!isTriggered) {
    return new Response('Not found valid commit', {
      status: 200
    })
  }

  const {
    data: { id: installation_id }
  } = await app.octokit.rest.apps.getRepoInstallation({
    owner: 'jill64',
    repo: 'rsac-synchronizer'
  })

  const octokit = await app.getInstallationOctokit(installation_id)

  const rsac_token =
    repo === '.github'
      ? await app.octokit.rest.apps
          .createInstallationAccessToken({
            installation_id
          })
          .then(({ data }) => data.token)
      : ''

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
