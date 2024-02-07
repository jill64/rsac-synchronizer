import { octoflare } from 'octoflare'
import { syncLabels } from './syncLabels.js'

export default octoflare(async ({ installation, payload }) => {
  if (!installation) {
    return new Response('No Installation', {
      status: 200
    })
  }

  if (!('repositories_added' in payload && payload.repositories_added)) {
    return new Response('No Trigger Event', {
      status: 200
    })
  }

  await Promise.allSettled(
    payload.repositories_added.map(async ({ full_name }) => {
      const [owner, repo] = full_name.split('/')
      return await Promise.allSettled([
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
          branch: 'main',
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
        ),
        syncLabels({
          owner,
          repo,
          kit: installation.kit
        })
      ])
    })
  )

  return new Response('Bootstrap Complete', {
    status: 200
  })
})
