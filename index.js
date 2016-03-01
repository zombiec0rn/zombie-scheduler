var cccf    = require('cccf')
var cdiff   = require('cccf-diff')
var clone   = require('clone')
var mapper  = require('./mapper')
var utils   = require('./utils')

// TODO: mapper.assignHosts(hosts, current, diff, _binpack)
// TODO: If !current return diff.add only ??

function spread(hosts, containers, current, opts) {
  opts = opts || {}
  var _diff = { add: unify(containers, opts), remove: [], keep: [] }
  if (current) _diff = diff(hosts, containers, current, opts)
  return mapper.assignHosts(hosts, current, _diff, utils.leastBusyHost)
}

function binpack(hosts, containers, current, opts) {
  opts = opts || {}
  var _diff = { add: unify(containers, opts), remove: [], keep: [] }
  if (current) _diff = diff(hosts, containers, current, opts)
  // TODO: replace leastBusyHost with something else
  return mapper.assignHosts(hosts, current, _diff, utils.leastBusyHost)
}

function unify(containers, opts) {
  return mapper.unifyContainers(clone(containers), opts.ignore)
}

function diff(hosts, containers, current, opts) {
  var unified_current = unify(current, opts)
  var unified_containers = unify(containers, opts)
  return cdiff(unified_current, unified_containers)
}

module.exports = {
  spread: spread,
  binpack: binpack
} 
