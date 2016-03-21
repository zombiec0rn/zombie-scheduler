# Zombie Scheduler 

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

Comping soon.

#### `unify(zservices, opts)`

The unify function used internally to align services. This causes all sorts of havoc since it modifies the passed service configs prior to diff. A better approach would be to have a strict schema for services passed to this module, and perhaps provide the `unify` functionality as a separate module? To get around this currently, consider using the `fingerprint` functionaly of [zombie-service-diff](https://github.com/zombiec0rn/zombie-service-diff). 

## TODO

* Remove the need for `unify` 

## Changelog

### 2.1.0

* Exposing the `unify` function 

### 2.0.0

* Bumped zombie-service-diff to next major with `fingerprint` support

### 1.0.0

* Initial release :tada:

enjoy.
