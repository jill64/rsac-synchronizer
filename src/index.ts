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

  const isTriggered = commits.some((commit) =>
    commit.modified.includes('rsac.yml')
  )

  if (!isTriggered) {
    return new Response("Not found 'rsac.yml'", {
      status: 200
    })
  }

  await app.octokit.rest.actions.createWorkflowDispatch({
    owner: 'jill64',
    repo: 'rsac-synchronizer',
    workflow_id: 'synchronize.yml',
    ref: 'main',
    inputs: {
      token: installation.token,
      owner: repository.owner.login,
      repo: repository.name,
      ref: payload.ref.replace('refs/heads/', '')
    }
  })

  return new Response(null, {
    status: 202
  })
})
