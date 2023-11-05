import { octoflare } from 'octoflare'
import { makeContexts } from './steps/makeContexts.js'

export default octoflare(async ({ installation, payload }) => {
  if (!('repository' in payload && payload.repository)) {
    return new Response('No Trigger Event', {
      status: 200
    })
  }

  if (!installation) {
    return new Response('No Installation', {
      status: 200
    })
  }

  const { repository } = payload

  const octokit = installation.kit
  const owner = repository.owner.login
  const repo = repository.name
  const ref = repository.default_branch

  const contexts = await makeContexts({ owner, repo, ref, octokit })

  const process = [
    octokit.rest.repos.update({
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
    octokit.rest.repos.updateBranchProtection({
      owner,
      repo,
      branch: ref,
      required_status_checks: {
        strict: true,
        contexts
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
    octokit.rest.actions.setGithubActionsDefaultWorkflowPermissionsRepository({
      owner,
      repo,
      default_workflow_permissions: 'read',
      can_approve_pull_request_reviews: false
    })
  ]

  await Promise.all(process)

  return new Response('Complete Synchronize', {
    status: 200
  })
})
