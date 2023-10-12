import type { WebhookEvent } from 'octoflare/webhook'

export const onCreateRepo = (payload: WebhookEvent) => {
  if (!('repository' in payload)) {
    return null
  }

  if (!('action' in payload)) {
    return null
  }

  if (payload.action !== 'created') {
    return null
  }

  if (!payload.repository) {
    return null
  }

  const { repository } = payload

  const owner = repository.owner.login
  const repo = repository.name
  const ref = repository.default_branch

  return {
    repo,
    owner,
    ref
  }
}
