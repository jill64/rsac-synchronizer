<div align="center">
<img src="./assets/logo.png" width="100px" />
</div>

# RSaC Synchronizer

GitHub Repository Settings as Code

[GitHub App](https://github.com/apps/rsac-synchronizer)

## rsac.yaml

```yml
# https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#update-a-repository
repository:
  allow_auto_merge: true

# https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28#update-branch-protection
branch-protection:
  - branch-name:
    required_status_checks:
      strict: true
      checks:
        - lint
        - build

#https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#replace-all-repository-topics
topics:
  - topic-name-1
  - topic-name-2
  - topic-name-3
```
