var omit  = require('lodash.omit')
var clone = require('clone')
var scale = require('cccf-scale')
var utils = require('./utils')

module.exports = {

    unifyContainers : function(containers, ignore) { 
        if (ignore) containers = containers.filter(function(c) { return ignore.indexOf(c.id) })
        containers = containers.filter(utils.validateContainer)
        containers = scale.up(containers)
        containers = containers.map(function(container) {
            var c = omit(container, ['host','scale'])
            if (c.image.indexOf(':') < 0) c.image = c.image+':latest'
            return c
        })
        return containers
    },

    assignHosts : function(hosts, current, diff, balancer) {
        var keepWithHosts = diff.keep.map(function(keep) { 
            keep.host = utils.pickContainerById(keep.id, current).host
            return keep
        })

        var postRunWithHosts = clone(keepWithHosts)
        var addWithHosts = diff.add.map(function(container) {
            container.host = balancer(postRunWithHosts, hosts) // <- Balancing via balancer 
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
