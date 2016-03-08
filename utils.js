var cccf  = require('cccf')
var scale = require('cccf-scale')
var omit  = require('lodash.omit')
var find  = require('lodash.find')
var bytes = require('bytes')

function isObject(a) {
  return (!!a) && (a.constructor === Object)
}
function isArray(a) {
  return (!!a) && (a.constructor === Array)
}
function validateContainer(container) {
  try      { cccf.validate(container); return true }
  catch(e) { process.stderr.write(e); return false }
}
function hostifyDiff(current, diff) {
  diff.keep = diff.keep.map(function(keep) { 
    keep.host = find(current, ['id', keep.id]).host
    return keep
  })
  diff.remove = diff.remove.map(function(remove) { 
    remove.host = find(current, ['id', remove.id]).host
    return remove
  })
  return diff
}
function unifyContainers(containers, ignore) {
  if (ignore) containers = containers.filter(function(c) { return ignore.indexOf(c.id) })
  containers = containers.filter(validateContainer)
  containers = scale.up(containers)
  containers = containers.map(function(container) {
    var c = omit(container, ['host','scale'])
    if (c.image.indexOf(':') < 0) c.image = c.image+':latest'
    // TODO: Validate memory and cpu !! VERY IMPORTANT !!
    if (c.memory) c.memory = bytes(c.memory)
    return c
  })
  return containers
}
// TODO: Add test for sortByMemoryAndCpu
function sortByMemoryAndCpu(a,b) {
  if (a.memory == b.memory) {
    return (a.cpu < b.cpu) ? 1 : (a.cpu > b.cpu) ? -1 : 0
  }
  else {
    return (a.memory < b.memory) ? 1 : -1
  }
}

module.exports = {
  isArray: isArray,
  isObject: isObject,
  hostifyDiff: hostifyDiff,
  unifyContainers: unifyContainers,
  sortByMemoryAndCpu: sortByMemoryAndCpu
}
