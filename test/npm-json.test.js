import { test } from 'node:test'
import assert from 'node:assert/strict'
import { packResult, viewResult } from '../scripts/npm-json.js'

const result = {
  name: 'example',
  filename: 'example-2.0.0.tgz',
  files: [{ path: 'index.js' }]
}

test('accepts npm 11 and npm 12 pack JSON without losing file metadata', () => {
  assert.deepEqual(packResult([result]), result)
  assert.deepEqual(packResult({ example: result }), result)
  assert.throws(() => packResult({}), /Expected one/)
  assert.throws(
    () => packResult({ error: { message: 'failed' } }),
    /Unexpected npm pack/
  )
  assert.throws(() => packResult([result, result]), /Expected one/)
})

test('accepts scalar and array npm view results and rejects ambiguous results', () => {
  assert.equal(viewResult('2.0.0'), '2.0.0')
  assert.equal(viewResult(['2.0.0']), '2.0.0')
  const dist = { integrity: 'sha512-example' }
  assert.deepEqual(viewResult(dist), dist)
  assert.deepEqual(viewResult([dist]), dist)
  assert.throws(() => viewResult([]), /Expected one/)
  assert.throws(() => viewResult(['1.0.0', '2.0.0']), /Expected one/)
})
