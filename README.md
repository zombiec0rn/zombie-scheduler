# zombie-scheduler

A scheduler for [zombies]().

## Install

```sh
npm install --save @zombiec0rn/zombie-scheduler
```

## Use

```js
require('@zombiec0rn/zombie-scheduler').spread(znodes, zservices)
// => {
//  add: [...],
//  keep: [...],
//  remove: [...]
// }
```

## API

#### `spread(nodes, wanted, current, opts)`

Spread will spread out your services as much as possible - new services go on least busy node. 

#### `binpack(nodes, wanted, current, opts)`

WIP

## Changelog

### 1.0.0

* Initial release :tada:

enjoy.
