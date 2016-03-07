var omit  = require('lodash.omit')
var clone = require('clone')
var scale = require('cccf-scale')
var utils = require('./utils')
var bytes = require('bytes')

module.exports = {

    unifyContainers : function(containers, ignore) { 
        if (ignore) containers = containers.filter(function(c) { return ignore.indexOf(c.id) })
        containers = containers.filter(utils.validateContainer)
        containers = scale.up(containers)
        containers = containers.map(function(container) {
            var c = omit(container, ['host','scale'])
            if (c.image.indexOf(':') < 0) c.image = c.image+':latest'
            // TODO: Validate memory and cpu !! VERY IMPORTANT !!
            if (c.memory) c.memory = bytes(c.memory)
            return c
        })
        return containers
    },

    assignHosts : function(hosts, current, diff, balancer) {
        var keepWithHosts = diff.keep.map(function(keep) { 
            keep.host = utils.pickContainerById(keep.id, current).host
            return keep
        })

        // Sort by memory usage (need to place large first)
        diff.add.sort(function(a,b) {
          if (a.memory < b.memory) {
            return 1;
          }
          if (a.memory > b.memory) {
            return -1;
          }
          return 0;
        })

        // Calculate available first
        var calculateValidHosts = function(containers, hosts, next) {
          return hosts.filter(function(host) {
            var usedMem = containers.reduce(function(total, container) {
              if (container.host.hostname == host.hostname) total += container.memory
              return total
            },0)
            var availableMem = host.memory - usedMem
//            console.log(host.hostname, 
//              'avail', 
//              bytes(availableMem), 
//              'next',
//              bytes(next.memory),
//              next.memory < availableMem)
            return next.memory < availableMem
          })
        }

        var postRunWithHosts = clone(keepWithHosts)
        var addWithHosts = diff.add.map(function(container) {
            var validHosts = calculateValidHosts(postRunWithHosts, hosts, container) 
            if (validHosts.length == 0) throw new Error("No more valid nodes. Consider increasing # nodes available.")
            container.host = balancer(postRunWithHosts, validHosts) // <- Balancing via balancer 
            postRunWithHosts = postRunWithHosts.concat(container)
            return container
        })

        var removeWithHosts = diff.remove.map(function(container) { 
            container.host = utils.pickContainerById(container.id, current).host
            return container
        })

        return {
            add    : addWithHosts,
            keep   : keepWithHosts, 
            remove : removeWithHosts
        }
    }

}
