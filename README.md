# cccf-scheduler

A scheduler for [cccf](https://github.com/asbjornenge/cccf).

* WIP (work in progress)

## Install

```sh
npm install --save cccf-scheduler
```

## Use

```js
var scheduler = require('cccf-scheduler')
var spread = scheduler.spread(hosts, containers)
// => {
//  add: [...],
//  keep: [...],
//  remove: [...]
// }
```

## API

#### `spread(hosts, wanted, current)`

#### `binpack(hosts, wanted, current)`

enjoy.
