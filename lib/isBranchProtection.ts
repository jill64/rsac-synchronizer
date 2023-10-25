import {
  Null,
  array,
  boolean,
  isObject,
  optional,
  scanner,
  string,
  union
} from 'typescanner'

const required_status_checks = union(
  scanner({
    strict: boolean,
    contexts: array(string)
  }),
  Null
)

/** @see https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28#update-branch-protection */
export const isBranchProtection = scanner({
  required_status_checks,
  enforce_admins: union(boolean, Null),
  required_pull_request_reviews: union(isObject, Null),
  restrictions: union(
    scanner({
      users: array(string),
      teams: array(string),
      apps: optional(array(string))
    }),
    Null
  )
})
