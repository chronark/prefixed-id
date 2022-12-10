<div align="center">
    <h1 align="center">@chronark/prefixed-id</h1>
    <h5>pre_JUbF9zRGz9hrFXUyNJLXcowD9GsqCD</h5>
</div>

<br/>

A minimal library to generate Stripe inspired predixed ids for your application.
Prefixed ids look like this: `pre_JUbF9zRGz9hrFXUyNJLXcowD9GsqCD`. They can be very useful if you
have different entities and want to quickly identify them.

Generated ids rely on the provided crypto implementation. If you use either `window.crypto` or 
`crypto` from "node:crypto", the ids will be cryptographically secure.


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

## Options 

You may pass these options to the constructor to customize the id generation.

```ts
{
	/**
	 *
	 * @default "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	 */
	alphabet?: string;

	/**
	 * Either window.crypto or crypto from node
	 *
	 * @default window?.crypto
	 */
	crypto?: Crypto;

	/**
	 * Byte size of the generated id
	 */
	size?: number;
};
```