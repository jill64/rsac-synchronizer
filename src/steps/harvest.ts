import { Octokit } from 'octoflare/octokit'
import { getDirFiles } from '../utils/getDirFiles.js'
import { getFile } from '../utils/getFile.js'
import { isValidPackageJson } from '../utils/isValidPackageJson.js'

export const harvest = async ({
  owner,
  repo,
  octokit,
  ref
}: {
  owner: string
  repo: string
  octokit: Octokit
  ref: string
}) => {
  const [workflowFiles, packageJson] = await Promise.all([
    getDirFiles({
      owner,
      repo,
      path: '.github/workflows',
      ref,
      octokit
    }),
    getFile({
      owner,
      repo,
      path: 'package.json',
      ref,
      octokit
    }).then((str) => {
      try {
        const json = str ? (JSON.parse(str) as unknown) : null
        return isValidPackageJson(json) ? json : null
      } catch {
        return null
      }
    })
  ])

  return {
    workflowFiles,
    packageJson
  }
}
