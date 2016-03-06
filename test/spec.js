import test      from 'ava'
import clone     from 'clone'
import example   from 'cccf/example.json'
import scheduler from '../index'

let hosts = [
  {
    hostname: 'asbjornenge-gw'
  },
  {
    hostname: 'asbjornenge-node-1'
  },
  {
    hostname: 'asbjornenge-node-2'
  }
]

let current = [
  clone(example),
  clone(example)
]

let wanted = [
  clone(example),
  clone(example)
]
current[1].id = 'yolo'
current[1].host = hosts[1] 
current[0].host = hosts[0] 
wanted[1].id = 'another'


test('spread', t => {
  let spread = scheduler.spread(hosts, wanted, current)
  t.true(spread.add.map(c => c.id).indexOf('another') == 0)
  t.true(spread.keep.map(c => c.id).indexOf('app') == 0)
  t.true(spread.remove.map(c => c.id).indexOf('yolo') == 0)
  t.true(spread.add.length == 1)
  t.true(spread.keep.length == 1)
  t.true(spread.remove.length == 1)
  let hostnames = hosts.map(h => h.hostname) 
  t.true(hostnames.indexOf(spread.add[0].host.hostname) >= 0)
  t.true(hostnames.indexOf(spread.keep[0].host.hostname) >= 0)
  t.true(spread.add[0].host.hostname != spread.keep[0].host.hostname)
})

