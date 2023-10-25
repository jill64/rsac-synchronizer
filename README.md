<!----- BEGIN GHOST DOCS LOGO src="./assets/logo.png" ----->

<div align="center">
<img src="./assets/logo.png" width="100px" />
</div>

<!----- END GHOST DOCS LOGO ----->

<!----- BEGIN GHOST DOCS HEADER ----->

# Rsac Synchronizer

[![rsac-synchronizer.yml](https://github.com/jill64/rsac-synchronizer/actions/workflows/rsac-synchronizer.yml/badge.svg)](https://github.com/jill64/rsac-synchronizer/actions/workflows/rsac-synchronizer.yml) [![github-app](https://img.shields.io/badge/GitHub_App-Rsac_Synchronizer-midnightblue)](https://github.com/apps/rsac-synchronizer) [![octoflare](https://img.shields.io/badge/framework-🌤️Octoflare-dodgerblue)](https://github.com/jill64/octoflare)

⚙️ GitHub Repository Settings as Code

<!----- END GHOST DOCS HEADER ----->

## Config file resolution

- Place `rsac.yml` in the repository root to describe the configuration.
- Creating `rsac.yml` in a `.github` repository applies to all repositories in your account.
- The contents of each `rsac.yml` are merged.

## When to apply settings

| Event                 | Files                                |
| --------------------- | ------------------------------------ |
| Create Repo           | `.github/rsac.yml`                   |
| Push (Default Branch) | `.github/rsac.yml` + `repo/rsac.yml` |

## rsac.yml

```yml
# https://docs.github.com/en/rest/repos/repos#update-a-repository

repository:
  allow_auto_merge: true

# https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection

branch-protection:
  branch-name:
    required_status_checks:
      strict: true
      contexts:
        - test / run-vitest
        - e2e-test / run-playwright

#https://docs.github.com/en/rest/repos/repos#replace-all-repository-topics

topics:
  - topic-name-1
  - topic-name-2
  - topic-name-3

# https://docs.github.com/en/rest/actions/permissions#set-default-workflow-permissions-for-a-repository

default-workflow-permissions:
  default_workflow_permissions: read
  can_approve_pull_request_reviews: false
```
