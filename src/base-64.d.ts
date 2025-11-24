declare module 'base-64' {
	/** Encodes a string to base64 */
	export function encode(input: string): string;
	/** Decodes a base64 string to a normal string */
	export function decode(input: string): string;
}
