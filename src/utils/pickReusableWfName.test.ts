import { expect, test } from 'vitest'
import { pickReusableWfName } from './pickReusableWfName.js'

test('pickReusableWfName', () => {
  expect(
    pickReusableWfName('jill64/.github/.github/workflows/run-vitest.yml@main')
  ).toBe('run-vitest')

  expect(
    pickReusableWfName('jill64/.github/workflows/run-vitest.yml@main')
  ).toBe(undefined)
})
