var cccf    = require('cccf')
var cdiff   = require('cccf-diff')
var clone   = require('clone')
var async   = require('async')
var mapper  = require('./mapper')
var utils   = require('./utils')

// TODO: Clone before unify - unify func?
// TODO: mapper.assignHosts(hosts, current, diff, _spread)
// TODO: mapper.assignHosts(hosts, current, diff, _binpack)
// TODO: If !current return diff.add only ??

function spread(hosts, containers, current, opts) {
  var _diff = { add: unifyContainers(containers, opts.ignore), remove: [], keep: [] }
  if (current) _diff = diff(hosts, containers, current, opts)
  // -> do the thing
  return mapper.assignHosts(hosts, current, diff)
}

function binpack(hosts, containers, current, opts) {
  var _diff = { add: containers, remove: [], keep: [] }
  if (current) _diff = diff(hosts, containers, current, opts)
  // -> do the thing
  return mapper.assignHosts(hosts, current, diff)
}

function diff(hosts, containers, current, opts) {
  opts = opts || {}
  var unified_current = mapper.unifyContainers(current, opts.ignore)
  var unified_containers = mapper.unifyContainers(containers, opts.ignore)
  return cdiff(unified_current, unified_containers)
}

module.exports = {
  diff: diff,
  spread: spread,
  binpack: binpack
} 
