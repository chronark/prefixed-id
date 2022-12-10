type NodeCrypto = {
	randomBytes: (size: number) => Buffer;
};
type WebCrypto = {
	getRandomValues: (
		typedArray:
			| Int8Array
			| Uint8Array
			| Uint8ClampedArray
			| Int16Array
			| Uint16Array
			| Int32Array
			| Uint32Array
			| BigInt64Array
			| BigUint64Array,
	) =>
		| Int8Array
		| Uint8Array
		| Uint8ClampedArray
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| BigInt64Array
		| BigUint64Array;
};
type Crypto = NodeCrypto | WebCrypto;

export type Config<TPrefixes extends string> = {
	/**
	 *
	 * @default "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
	 */
	alphabet?: string;

	/**
	 * Either window.crypto or crypto from node
	 *
	 * @default window?.crypto
	 *
	 * @example
	 */
	crypto?: Crypto;

	/**
	 * An object of prefixes for your domain
	 * The key should be the long name of the entity, while the value is the short prefix
	 *
	 * @example
	 * {
	 *  user: "u",
	 *  post: "p",
	 * }
	 */
	prefixes: Record<TPrefixes, string>;

	/**
	 * Byte size of the generated id
	 */
	size?: number;
};

/**
 * Generate ids similar to stripe
 */
export class IdGenerator<TPrefixes extends string> {
	private readonly prefixes: Record<TPrefixes, string>;
	private readonly crypto: Crypto;
	private readonly size: number;
	private readonly alphabet: string;

	/**
	 * Length of alphabet
	 */
	private readonly base: number;

	private readonly baseMap: Uint8Array;
	private readonly inverseFactor: number;

	/**
	 * Create a new id generator with fully typed prefixes
	 * @param prefixes - Relevant prefixes for your domain
	 */
	constructor({
		prefixes,
		alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
		size = 16,
		crypto = window?.crypto,
	}: Config<TPrefixes>) {
		this.crypto = crypto;
		this.prefixes = prefixes;
		this.size = size;
		this.alphabet = alphabet;

		/**
		 * Setup encoder
		 */

		if (alphabet.length >= 255) {
			throw new TypeError("Alphabet must be < 255 characters long");
		}

		this.baseMap = new Uint8Array(256);
		for (let j = 0; j < this.baseMap.length; j++) {
			this.baseMap[j] = 255;
		}

		for (let i = 0; i < alphabet.length; i++) {
			const x = alphabet.charAt(i);
			const xc = x.charCodeAt(0);

			if (this.baseMap[xc] !== 255) {
				throw new TypeError(`${x} is ambiguous`);
			}
			this.baseMap[xc] = i;
		}

		this.base = alphabet.length;
		this.inverseFactor = Math.log(256) / Math.log(this.base);
	}

	/**
	 * Generate a new unique base58 encoded uuid with a defined prefix
	 *
	 * @returns xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	 */
	public id(prefix: TPrefixes, size: number = this.size): string {
		let buf = new Uint8Array(size);
		if ("getRandomValues" in this.crypto) {
			this.crypto.getRandomValues(buf);
		} else if ("randomBytes" in this.crypto) {
			buf = this.crypto.randomBytes(size);
		} else {
			throw new Error("Neither web nor node crypto was available");
		}

		return [this.prefixes[prefix], this.encode(buf)].join("_");
	}

	private encode(buf: Uint8Array): string {
		if (buf.length === 0) {
			return "";
		}

		// Skip & count leading zeroes.
		let zeroes = 0;
		let length = 0;
		let pbegin = 0;
		const pend = buf.length;

		while (pbegin !== pend && buf[pbegin] === 0) {
			pbegin++;
			zeroes++;
		}

		// Allocate enough space in big-endian base58 representation.
		const size = ((pend - pbegin) * this.inverseFactor + 1) >>> 0;
		const b58 = new Uint8Array(size);

		// Process the bytes.
		while (pbegin !== pend) {
			let carry = buf[pbegin];

			// Apply "b58 = b58 * 256 + ch".
			let i = 0;
			for (
				let it1 = size - 1;
				(carry !== 0 || i < length) && it1 !== -1;
				it1--, i++
			) {
				carry += (256 * b58[it1]) >>> 0;
				b58[it1] = (carry % this.base) >>> 0;
				carry = (carry / this.base) >>> 0;
			}

			if (carry !== 0) throw new Error("Non-zero carry");
			length = i;
			pbegin++;
		}

		// Skip leading zeroes in base58 result.
		let it2 = size - length;
		while (it2 !== size && b58[it2] === 0) {
			it2++;
		}

		// Translate the result into a string.
		let out = "";

		for (; it2 < size; ++it2) {
			out += this.alphabet.charAt(b58[it2]);
		}
		return out;
	}
}

import nodeCrypto from "node:crypto";

const idGenerator = new IdGenerator({
	prefixes: {
		user: "u",
	},
	crypto: nodeCrypto,
});

console.log(idGenerator.id("user"));
