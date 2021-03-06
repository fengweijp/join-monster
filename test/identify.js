import test from 'ava'
import { graphql } from 'graphql'
import schemaBasic from '../example/schema-basic/index'
import { partial } from 'lodash'

function wrap(query) {
  return `{
    users { ${query} }
  }`
}

const run = partial(graphql, schemaBasic)

test('it should handle a where condition', async t => {
  const query = `{
    user(id: 1) {
      fullName
    }
  }`
  const { data, errors } = await run(query)
  t.is(errors, undefined)
  const expect = {
    user: { fullName: 'andrew carlson' }
  }
  t.deepEqual(data, expect)
})

test('a query with a sqlDeps as the first requested field should not mess it up', async t => {
  const query = wrap('numFeet, fullName, id')
  const { data, errors } = await run(query)
  t.is(errors, undefined)
  const expect = {
    users: [
      {
        numFeet: 2,
        fullName: 'andrew carlson',
        id: 1
      },
      {
        numFeet: 2,
        fullName: 'matt elder',
        id: 2
      }
    ]
  }
  t.deepEqual(data, expect)
})

test('it should handle a single object in which the first requested field is a list', async t => {
  const query = `{
    user(id: 2) {
      posts { id, body }
    }
  }`
  const { data, errors } = await run(query)
  t.is(errors, undefined)
  const expect = {
    user: {
      posts: [
        {
          id: 1,
          body: 'If I could marry a programming language, it would be Haskell.'
        }
      ]
    }
  }
  t.deepEqual(data, expect)
})

test('it should handle composite keys', async t => {
  const query = `{
    sponsors {
      numLegs, lastName
    }
  }`
  const { data, errors } = await run(query)
  t.is(errors, undefined)
  const expect = {
    sponsors: [
      { numLegs: 2, lastName: 'bachman' },
      { numLegs: 2, lastName: 'bachman' },
      { numLegs: 2, lastName: 'bachman' },
      { numLegs: 2, lastName: 'bachman' },
      { numLegs: 2, lastName: 'daemon' },
    ]
  }
  t.deepEqual(data, expect)
})

