import type { WebhookEvent } from 'octoflare/webhook'

export const onPush = (payload: WebhookEvent) => {
  if (!('commits' in payload)) {
    return null
  }

  const { repository, commits } = payload

  const owner = repository.owner.login
  const repo = repository.name
  const ref = payload.ref.replace('refs/heads/', '')

  if (ref !== repository.default_branch) {
    return null
  }

  const isTriggered = commits.some(
    (commit) =>
      commit.modified.includes('rsac.yml') ||
      commit.added.includes('rsac.yml') ||
      commit.removed.includes('rsac.yml')
  )

  if (!isTriggered) {
    return null
  }

  return {
    repo,
    owner,
    ref
  }
}
