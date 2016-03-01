var cccf    = require('cccf')
var cdiff   = require('cccf-diff')
var clone   = require('clone')
var async   = require('async')
var mapper  = require('./scheduler-mapper')
var utils   = require('./scheduler-utils')
var autils  = require('./scheduler-utils-async')

var scheduler = {

    working       : false,
    working_timer : null,

    diff : function(current_containers, wanted_containers, opts) {
        opts = opts || {}
        var unified_current_containers = mapper.unifyContainers(
          current_containers, 
          opts.ignore
        )
        var unified_wanted_containers  = mapper.unifyContainers(
          wanted_containers, 
          opts.ignore
        )
        return cdiff(unified_current_containers, unified_wanted_containers)
    },

    assignHosts : function(hosts, current_containers, diff) {
        return mapper.assignHosts(hosts, current_containers, diff)
    },

    apply : function(state, wanted_containers) {
        if (scheduler.working) return
        scheduler.working = true
        scheduler.applyDiffAsync(
          state,
          scheduler.assignHosts(
            state.hosts, 
            state.containers, 
            scheduler.diff(state.containers, wanted_containers)
          )
        )
    },

    applyDiffAsync : function(state, diff) {

        var kill = async.compose(autils.execInstruction.bind({i:'kill'}), autils.queryHostVersion.bind({hosts:state.hosts}))
        var rm   = async.compose(autils.execInstruction.bind({i:'rm'}),   autils.queryHostVersion.bind({hosts:state.hosts}))
        var run  = async.compose(autils.execInstruction.bind({i:'run', exclude : ['scale','host']}), autils.queryHostVersion.bind({hosts:state.hosts}))

        async.map(clone(diff.remove), kill, function(err, results) {
            if (err) { scheduler.handleError(err); return }
            async.map(clone(diff.remove), rm, function(err, results) {
                if (err) { scheduler.handleError(err); return }
                async.map(clone(diff.add), run, function(err, results) {
                    if (err) { scheduler.handleError(err); return }
                    scheduler.working = false
                    // console.log(results)
                })
            })
        })
    },

    handleError : function(err) {
        console.error(err)
        setTimeout(function() {
            scheduler.working = false
        },300000) // Give the cluster some time to recover and don't flood the logs
    }

}

module.exports = scheduler