import test      from 'ava'
import clone     from 'clone'
import bytes     from 'bytes'
import cccf      from 'cccf'
import example   from 'cccf/example.json'
import scheduler from '../index'
import utils     from '../utils'

let nodes = require('./nodes.json')
function scaleNodes(num) {
  return Array.apply(null, {length: num}).map((v,i) => {
    let base = clone(nodes[1])
    base.hostname = 'asbjornenge-node-'+i
    return base
  })
}

test('spread', t => {
  let current = cccf.random(5, { 
    host: nodes[0],
    memory: '500MB',
    cpu: 500
  })
  let wanted = cccf.random(3, {
    memory: '500MB',
    cpu: 500
  })
  wanted.push(clone(current[0]))
  wanted.push(clone(current[1]))

  let spread = scheduler.spread(nodes, wanted, current)
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
    t.true(keep.host.hostname == nodes[0].hostname)
  })
  // ASSERT NEW ARE PROPERLY SPREAD
  var newnodes = []
  spread.add.forEach(add => {
    t.true(add.host.hostname != nodes[0].hostname)
    newnodes.push(add.host.hostname)
  })
  nodes
    .map(h => h.hostname)
    .filter(hn => hn != nodes[0].hostname)
    .forEach(hostname => {
      t.true(newnodes.indexOf(hostname) >= 0)
    })
})

test('spread with mem and cpu', t => {
  let small = cccf.random(70, {
    memory : '100MB',
    cpu: 100
  })
  let medium = cccf.random(30, {
    memory : '500MB',
    cpu: 500
  })
  let large = cccf.random(10, {
    memory : '1GB',
    cpu: 1000
  })
  let scaledNodes = scaleNodes(20)
  let spread = scheduler.spread(scaledNodes, small.concat(medium, large))
  let hostsWithLoad = spread.add.reduce((coll, curr) => {
    if (!coll[curr.host.hostname]) coll[curr.host.hostname] = {
      memory : 0,
      cpu: 0
    }
    coll[curr.host.hostname].memory += curr.memory
    coll[curr.host.hostname].cpu += curr.cpu
    return coll
  }, {})
  Object.keys(hostsWithLoad).forEach(hostname => {
    let origHost = scaledNodes.filter(node => node.hostname == hostname)[0]
    let loadedHost = hostsWithLoad[hostname]
    t.true(origHost.memory > loadedHost.memory)
  })
})

test('spread throws if cannot fit', t => {
  let large = cccf.random(10, {
    memory : '1GB',
    cpu: 2000
  })
  let scaledNodes = scaleNodes(2)
  try {
    let spread = scheduler.spread(scaledNodes, large)
    t.true(false)
  } catch(e) {
    t.true(true)
  }
})

test('spread without current', t => {
  let services = cccf.random(5, {
    memory : '500MB',
    cpu: 500
  })
  let scaledNodes = scaleNodes(2)
  let spread = scheduler.spread(scaledNodes, services)
  t.true(spread.add.length == 5)
  t.true(spread.keep.length == 0)
  t.true(spread.remove.length == 0)
})

test('sortByMemoryAndCpu', t => {
  let small = cccf.random(5, {
    memory : '100MB',
    cpu: 100
  })
  let medium = cccf.random(5, {
    memory : '500MB',
    cpu: 500
  })
  let large = cccf.random(5, {
    memory : '1GB',
    cpu: 1000
  })
  let largeCpu = cccf.random(5, {
    memory : '500MB',
    cpu: 2000
  })
  let all = [].concat(small, medium, large, largeCpu)
  let unified = utils.unifyContainers(all) // memory -> bytes
  let sorted = unified.sort(utils.sortByMemoryAndCpu)
  t.true(sorted.length == 20)
  sorted.slice(0,5).forEach(s => {
    t.true(bytes(s.memory) == '1GB')
    t.true(s.cpu == 1000)
  })
  sorted.slice(5,10).forEach(s => {
    t.true(bytes(s.memory) == '500MB')
    t.true(s.cpu == 2000)
  })
  sorted.slice(10,15).forEach(s => {
    t.true(bytes(s.memory) == '500MB')
    t.true(s.cpu == 500)
  })
  sorted.slice(15,20).forEach(s => {
    t.true(bytes(s.memory) == '100MB')
    t.true(s.cpu == 100)
  })
})

test('can ignore service ids', t => {
  let good = cccf.random(2, {
    memory: '10M',
    cpu: 10,
    tag: 'yolo'
  })
  let ignored = cccf.random(2, {
    memory: '10M',
    cpu: 10
  })
  var scaledNodes = scaleNodes(2)
  var spread = scheduler.spread(scaledNodes, [].concat(good, ignored), {
    ignore: ignored.map(i => i.id) 
  })
  t.true(spread.add.length == 2) 
  let goodIds = good.map(g => g.id)
  let addIds = spread.add.map(a => a.id)
  addIds.forEach(a => t.true(goodIds.indexOf(a) >= 0))
})

// TODO: Test all utils ?
