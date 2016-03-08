var clone = require('clone')
var utils = require('./utils')

module.exports = function(nodes, current, diff, opts) {
  diff.add.sort(utils.sortByMemoryAndCpu)
  var postRunWithHosts = clone(diff.keep)
  var validHosts = []
  diff.add = diff.add.map(function(container) {
      validHosts = calculateValidHosts(postRunWithHosts, nodes, container) 
      if (validHosts.length == 0) 
        throw new Error("No more valid nodes. Consider increasing # nodes available.")
      container.host = leastBusyHost(postRunWithHosts, validHosts)
      postRunWithHosts = postRunWithHosts.concat(container)
      return container
  })
  return diff
}

function leastBusyHost(runningContainers, hosts) {
  var _hosts = {}
  hosts.forEach(function(h) {
    _hosts[h.hostname] = h
  })
  var hostnames = hosts.map(function(h) { return h.hostname })
  var weights = runningContainers.reduce(function(map, container) {
    if (!map[container.host.hostname])
      map[container.host.hostname] = 1
    else
      map[container.host.hostname] += 1
    return map
  },{})
  var hostname = hostnames.reduce(function(curr, next) {
    var curr_weight = weights[curr] || 0
    var next_weight = weights[next] || 0
    return (next_weight > curr_weight) ? curr : next
  }, hostnames[0])
  return _hosts[hostname]
}

function calculateValidHosts(containers, hosts, next) {
  return hosts.filter(function(host) {
    var usedMem = containers.reduce(function(total, container) {
      if (container.host.hostname == host.hostname) total += container.memory
      return total
    },0)
    var usedCpu = containers.reduce(function(total, container) {
      if (container.host.hostname == host.hostname) total += container.cpu
      return total
    },0)
    var availableMem = host.memory - usedMem
    var availableCpu = host.cpus.reduce(function(speed, cpu) {
      speed += cpu.speed
      return speed
    },0) - usedCpu
    return (next.memory < availableMem && next.cpu < availableCpu)
  })
}
