var _     = require('lodash')
var clone = require('clone')
var scale = require('cccf-scale')
var utils = require('./utils')

module.exports = {

    unifyContainers : function(containers, containers_ignore) { 
        if (containers_ignore)
            containers.filter(function(c) { return containers_ignore.indexOf(c.id) })
        containers = containers.filter(utils.validateContainer)
        containers = scale.up(containers)
        containers = containers.map(function(container) {
            var c = _.omit(container, ['host','scale'])
            if (c.image.indexOf(':') < 0) c.image = c.image+':latest'
            return c
        })
        return containers
    },

    assignHosts : function(hosts, current_containers, diff) {
        var keepWithHosts = diff.keep.map(function(keep) { 
            keep.host = utils.pickContainerById(keep.id, current_containers).host
            return keep
        })

        var postRunWithHosts = clone(keepWithHosts)
        var addWithHosts = diff.add.map(function(container) {
            container.host = utils.leastBusyHost(postRunWithHosts, hosts) // <- Balancing via leastBusyHost 
            postRunWithHosts = postRunWithHosts.concat(container)
            return container
        })

        var removeWithHosts = diff.remove.map(function(container) { 
            container.host = utils.pickContainerById(container.id, current_containers).host
            return container
        })

        return {
            add    : addWithHosts,
            keep   : keepWithHosts, 
            remove : removeWithHosts
        }
    }

}
