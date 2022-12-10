<div align="center">
    <h1 align="center">@chronark/prefixed-id</h1>
    <h5>pre_JUbF9zRGz9hrFXUyNJLXcowD9GsqCD</h5>
</div>

<br/>

A minimal library to generate Stripe inspired predixed ids for your application.
Prefixed ids look like this: `pre_JUbF9zRGz9hrFXUyNJLXcowD9GsqCD`. They can be very useful if you
have different entities and want to quickly identify them.


Works in
- Nodejs
- Cloudflare Workers
- Vercel Edge


## Install

```
npm i @chronark/prefixed-id
```

## Usage

### Nodejs

```ts

import nodeCrypto from "node:crypto"

const idGenerator = new IdGenerator({
    prefixes: {
        "user": "u",
    },
    crypto: nodeCrypto
})

console.log(idGenerator.id("user"))
// u_PtbBA7NGcYYDpae6ULWujk
```

### WebCrypto

- Cloudflare Workers
- Vercel Edge

```ts
const idGenerator = new IdGenerator({
    prefixes: {
        "user": "u",
    },
    crypto: crypto // will be globally defined
})

console.log(idGenerator.id("user"))
// u_PtbBA7NGcYYDpae6ULWujk
```
