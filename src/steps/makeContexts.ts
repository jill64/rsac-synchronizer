import { attempt } from '@jill64/attempt'
import { OctoflareInstallation } from 'octoflare'
import yaml from 'yaml'
import { isValidPackageJson } from '../utils/isValidPackageJson.js'
import { isValidWorkflow } from '../utils/isValidWorkflow.js'
import { pickReusableWfName } from '../utils/pickReusableWfName.js'

export const makeContexts = async ({
  owner,
  repo,
  ref,
  installation
}: {
  owner: string
  repo: string
  ref: string
  installation: OctoflareInstallation
}): Promise<string[]> => {
  const [files, packageJson] = await Promise.all([
    attempt(async () => {
      const { data } = await installation.kit.rest.repos.getContent({
        owner,
        repo,
        path: '.github/workflows',
        ref
      })

      if (!Array.isArray(data)) {
        return []
      }

      const result = data.map(({ path }) =>
        installation.getFile(path, {
          ref,
          parser: (str) => {
            const yml = yaml.parse(str)

            if (!isValidWorkflow(yml)) {
              throw new Error(`Invalid workflow: ${path}`)
            }

            return yml
          }
        })
      )

      const list = await Promise.all(result)

      return list.map((x) => x?.data)
    }, []),

    installation.getFile('package.json', {
      ref,
      parser: (str) => {
        const json = str ? JSON.parse(str) : null
        return isValidPackageJson(json) ? json : null
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
    'Wraith CI',
    'Wraith CI - PR'
  ]

  const cloudflare = packageJson?.data?.devDependencies?.[
    '@sveltejs/adapter-cloudflare'
  ]
    ? ['Cloudflare Pages']
    : []

  return [...new Set([...defaultChecks, ...workflows, ...cloudflare])]
}
