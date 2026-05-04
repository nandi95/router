import { describe, expect, it } from 'vitest'
import { DEFAULT_OPTIONS, resolveOptions } from '../options'
import type { TreeNode } from '../core/tree'
import { PrefixTree } from '../core/tree'
import { EXPERIMENTAL_generateRouteParams } from './generateRouteParams'

describe('EXPERIMENTAL_generateRouteParams', () => {
  const RESOLVED_OPTIONS = resolveOptions(DEFAULT_OPTIONS)

  function createTreeWithParam(segment: string): TreeNode {
    const tree = new PrefixTree(RESOLVED_OPTIONS)
    return tree.insert(segment, `${segment}.vue`)
  }

  describe('excludes null from custom parser types', () => {
    it('required path param excludes null', () => {
      const node = createTreeWithParam('[version=semver]')
      const result = EXPERIMENTAL_generateRouteParams(
        node,
        ['Param_semver'],
        false
      )
      expect(result).toBe(
        '{ version: Exclude<Param_semver, unknown[] | null> }'
      )
    })

    it('optional path param includes null', () => {
      const node = createTreeWithParam('[[version=semver]]')
      const result = EXPERIMENTAL_generateRouteParams(
        node,
        ['Param_semver'],
        false
      )
      expect(result).toBe(
        '{ version: Exclude<Param_semver, unknown[] | null> | null }'
      )
    })

    it('repeatable path param uses Extract', () => {
      const node = createTreeWithParam('[version=semver]+')
      const result = EXPERIMENTAL_generateRouteParams(
        node,
        ['Param_semver'],
        false
      )
      expect(result).toBe('{ version: Extract<Param_semver, unknown[]> }')
    })

    it('optional repeatable path param uses Extract', () => {
      const node = createTreeWithParam('[[version=semver]]+')
      const result = EXPERIMENTAL_generateRouteParams(
        node,
        ['Param_semver'],
        false
      )
      expect(result).toBe('{ version: Extract<Param_semver, unknown[]> }')
    })
  })

  describe('non-parser types', () => {
    it('required path param is string', () => {
      const node = createTreeWithParam('[id]')
      const result = EXPERIMENTAL_generateRouteParams(node, [null], false)
      expect(result).toBe('{ id: string }')
    })

    it('optional path param includes null', () => {
      const node = createTreeWithParam('[[id]]')
      const result = EXPERIMENTAL_generateRouteParams(node, [null], false)
      expect(result).toBe('{ id: string | null }')
    })
  })
})
