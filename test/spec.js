import test      from 'ava'
import clone     from 'clone'
import example   from 'cccf/example.json'
import scheduler from '../index'

let current = [
  clone(example),
  clone(example)
]

let wanted = [
  clone(example),
  clone(example)
]
current[1].id = 'yolo'
wanted[1].id = 'another'

let hosts = [
  {
    hostname: 'asbjornenge-gw'
  },
  {
    hostname: 'asbjornenge-node'
  }
]

test('spread', t => {
  let spread = scheduler.spread(hosts, wanted, current)
  t.true(true)
})
