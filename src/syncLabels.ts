import { Octokit } from 'octoflare/octokit'

export const syncLabels = async ({
  owner,
  repo,
  kit
}: {
  owner: string
  repo: string
  kit: Octokit
}) => {
  const [{ data: bases }, { data: labels }] = await Promise.all([
    kit.rest.issues.listLabelsForRepo({
      owner,
      repo: 'unified-labeler'
    }),
    kit.rest.issues.listLabelsForRepo({
      owner,
      repo
    })
  ])

  await Promise.allSettled(
    bases.map((base) =>
      labels.some((x) => x.name === base.name)
        ? kit.rest.issues.updateLabel({
            owner,
            repo,
            name: base.name,
            new_name: base.name,
            color: base.color,
            description: base.description ?? ''
          })
        : kit.rest.issues.createLabel({
            owner,
            repo,
            name: base.name,
            color: base.color,
            description: base.description ?? ''
          })
    )
  )

  const { data: newLabels } = await kit.rest.issues.listLabelsForRepo({
    owner,
    repo
  })

  await Promise.allSettled(
    newLabels.map(async (label) => {
      if (!bases.some((x) => x.name === label.name)) {
        await kit.rest.issues.deleteLabel({
          owner,
          repo,
          name: label.name
        })
      }
    })
  )
}
