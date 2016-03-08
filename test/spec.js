import test      from 'ava'
import clone     from 'clone'
import bytes     from 'bytes'
import cccf      from 'cccf'
import example   from 'cccf/example.json'
import scheduler from '../index'

let nodes = require('./nodes.json')

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
  let scaledNodes = Array.apply(null, {length: 20}).map((v,i) => {
    let base = clone(nodes[1])
    base.hostname = 'asbjornenge-node-'+i
    return base
  })
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
//    console.log(hostname, bytes(origHost.memory), bytes(loadedHost.memory))
//    console.log(hostname, origHost.cpus.reduce((speed, cpu) => {
//      speed += cpu.speed
//      return speed
//    },0), loadedHost.cpu)
    t.true(origHost.memory > loadedHost.memory)
  })
})

test('spread throws if cannot fit', t => {
  let large = cccf.random(10, {
    memory : '1GB',
    cpu: 2000
  })
  let scaledNodes = Array.apply(null, {length: 2}).map((v,i) => {
    let base = clone(nodes[1])
    base.hostname = 'asbjornenge-node-'+i
    return base
  })
  try {
    let spread = scheduler.spread(scaledNodes, large)
    t.true(false)
  } catch(e) {
    t.true(true)
  }
})
