var cccf = require('cccf')

var utils = {

    validateContainer : function(container) {
        try      { cccf.validate(container); return true }
        catch(e) { process.stderr.write(e); return false }
    },

    pickHostByName : function(name, hosts) {
        return hosts.filter(function(host) {
            return host.name == name
        })[0]
    },

    stringifyHost : function(host) {
        var protocol = host.protocol || 'tcp'
        return protocol+'://'+host.host+':'+host.port
    },

    pickContainerById : function(id, current_containers) {
        return current_containers.filter(function(c) {
            return c.id == id
        })[0]
    },

    leastBusyHost : function(runningContainers, hosts) {
        var _hosts = {}
        hosts.forEach(h => {
          _hosts[h.hostname] = h
        })
        var hostnames = hosts.map(h => h.hostname)
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
    },
}

module.exports = utils 
