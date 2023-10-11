import memoize from 'lodash/memoize.js'
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

  const isOwner = memoize(async (name: string) => {
    if (name === owner) {
      return true
    }

    if (repository.owner.type !== 'Organization') {
      return false
    }

    const {
      data: { role }
    } = await installation.kit.rest.orgs.getMembershipForUser({
      org: owner,
      username: name
    })

    return role === 'admin'
  })

  const isTriggered = commits
    .filter((commit) => commit.modified.includes('rsac.yml'))
    .every((commit) => isOwner(commit.author.name))

  if (!isTriggered) {
    return new Response('Not found valid commit', {
      status: 200
    })
  }

  const octokit = await app.octokit.rest.apps
    .getRepoInstallation({
      owner: 'jill64',
      repo: 'rsac-synchronizer'
    })
    .then(({ data: { id } }) => app.getInstallationOctokit(id))

  await octokit.rest.actions.createWorkflowDispatch({
    owner: 'jill64',
    repo: 'rsac-synchronizer',
    workflow_id: 'synchronize.yml',
    ref: 'main',
    inputs: {
      token: installation.token,
      owner,
      repo,
      ref
    }
  })

  return new Response(null, {
    status: 202
  })
})
