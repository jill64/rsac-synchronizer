import { octoflare } from 'octoflare'

export default octoflare(async ({ installation, payload }) => {
  if (!installation) {
    return new Response('No Installation', {
      status: 200
    })
  }

  if (
    !(
      'repository' in payload &&
      payload.repository &&
      'action' in payload &&
      payload.action === 'created'
    )
  ) {
    return new Response('No Trigger Event', {
      status: 200
    })
  }

  const { repository } = payload

  const owner = repository.owner.login
  const repo = repository.name

  const process = [
    installation.kit.rest.repos.update({
      owner,
      repo,
      has_projects: false,
      has_wiki: false,
      allow_squash_merge: false,
      allow_rebase_merge: false,
      allow_auto_merge: true,
      delete_branch_on_merge: true,
      allow_update_branch: true
    }),
    installation.kit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch: repository.default_branch,
      required_status_checks: {
        strict: true,
        contexts: ['Wraith CI', 'Wraith CI / PR']
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        required_approving_review_count: 0
      },
      restrictions: null,
      allow_deletions: false,
      lock_branch: false,
      allow_force_pushes: false
    }),
    installation.kit.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository(
      {
        owner,
        repo,
        default_workflow_permissions: 'read',
        can_approve_pull_request_reviews: false
      }
    )
  ]

  await Promise.all(process)

  return new Response('Bootstrap Complete', {
    status: 200
  })
})
