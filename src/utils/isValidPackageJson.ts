import { optional, scanner, string } from 'typescanner'

export const isValidPackageJson = scanner({
  devDependencies: optional(
    scanner({
      '@sveltejs/adapter-cloudflare': optional(string)
    })
  )
})
