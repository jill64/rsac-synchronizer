import { Octokit } from 'octoflare/octokit'
import yaml from 'yaml'
import { getDirFiles } from '../utils/getDirFiles.js'
import { getFile } from '../utils/getFile.js'
import { isValidPackageJson } from '../utils/isValidPackageJson.js'
import { isValidWorkflow } from '../utils/isValidWorkflow.js'
import { pickReusableWfName } from '../utils/pickReusableWfName.js'

export const makeContexts = async ({
  owner,
  repo,
  ref,
  octokit
}: {
  owner: string
  repo: string
  ref: string
  octokit: Octokit
}): Promise<string[]> => {
  const [files, packageJson] = await Promise.all([
    getDirFiles({
      owner,
      repo,
      path: '.github/workflows',
      ref,
      octokit
    }).then((files) =>
      files.map((file) => {
        try {
          const yml = file ? yaml.parse(file) : null
          return isValidWorkflow(yml) ? yml : null
        } catch {
          return null
        }
      })
    ),
    getFile({
      owner,
      repo,
      path: 'package.json',
      ref,
      octokit
    }).then((str) => {
      try {
        const json = str ? JSON.parse(str) : null
        return isValidPackageJson(json) ? json : null
      } catch {
        return null
      }
    })
  ])

  const workflows = files
    .filter((wf) => wf?.on === 'push' || wf?.on === 'pull_request')
    .flatMap((file) => Object.entries(file?.jobs ?? {}))
    .flatMap(([job_name, job]) => {
      if ('uses' in job) {
        const file_name = pickReusableWfName(job.uses)
        return job_name && file_name ? `${job_name} / ${file_name}` : ''
      }

      if ('strategy' in job) {
        return Object.entries(job.strategy?.matrix ?? {}).flatMap(
          ([, values]) => values.map((value) => `${job_name} (${value})`)
        )
      }

      return job_name
    })
    .filter((x) => x)

  const defaultChecks = [
    'Ghost Lint',
    'Ghost Build',
    'Ghost Format',
    'Version Integrity'
  ]

  const build = packageJson?.devDependencies?.['@sveltejs/adapter-cloudflare']
    ? 'Cloudflare Pages'
    : 'Ghost Build'

  return [...new Set([...defaultChecks, ...workflows, build])]
}
