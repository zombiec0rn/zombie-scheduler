# cccf-scheduler

A scheduler for [cccf](https://github.com/asbjornenge/cccf).

* WIP (work in progress)
* Not ready for use.
* Needs rewrite

*The internals of this module is so ugly they looked out the window and got arrested for mooing* :cow:


## Install

```sh
npm install --save cccf-scheduler
```

## Use

```js
var scheduler = require('cccf-scheduler')
var withHosts = scheduler.spread(hosts, containers)
```

## API

#### `spread(hosts, wanted, current)`

#### `binpack(hosts, wanted, current)`

enjoy.
