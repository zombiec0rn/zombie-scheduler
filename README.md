# cccf-scheduler

A scheduler for [cccf](https://github.com/asbjornenge/cccf).

* WIP (work in progress)

## Install

```sh
npm install --save cccf-scheduler
```

## Use

```js
require('cccf-scheduler').spread(nodes, services)
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
