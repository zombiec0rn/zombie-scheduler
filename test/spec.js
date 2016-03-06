import test      from 'ava'
import clone     from 'clone'
import cccf      from 'cccf'
import example   from 'cccf/example.json'
import scheduler from '../index'

let hosts = [
  {
    hostname: 'asbjornenge-node-1'
  },
  {
    hostname: 'asbjornenge-node-2'
  },
  {
    hostname: 'asbjornenge-node-3'
  }
]

let current = cccf.random(5, { host: hosts[0] })
let wanted = cccf.random(3)
wanted.push(clone(current[0]))
wanted.push(clone(current[1]))

test('spread', t => {
  let spread = scheduler.spread(hosts, wanted, current)
  wanted.forEach(w => {
    t.true(
      spread.add.map(c => c.id).indexOf(w.id) >= 0 ||
      spread.keep.map(c => c.id).indexOf(w.id) >= 0
    )
  })
  current.forEach(cc => {
    t.true(
      spread.keep.map(c => c.id).indexOf(cc.id) >= 0 ||
      spread.remove.map(c => c.id).indexOf(cc.id) >= 0
    )
  })
  t.true(spread.add.length == 3)
  t.true(spread.keep.length == 2)
  t.true(spread.remove.length == 3)
  // ASSERT KEEPS ARE KEPT ON SAME HOST
  spread.keep.forEach(keep => {
    t.true(keep.host.hostname == hosts[0].hostname)
  })
  // ASSERT NEW ARE PROPERLY SPREAD
  var newHosts = []
  spread.add.forEach(add => {
    t.true(add.host.hostname != hosts[0].hostname)
    newHosts.push(add.host.hostname)
  })
  hosts
    .map(h => h.hostname)
    .filter(hn => hn != hosts[0].hostname)
    .forEach(hostname => {
      t.true(newHosts.indexOf(hostname) >= 0)
    })
})

