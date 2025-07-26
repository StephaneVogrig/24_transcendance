import * as ia from './ai.js';

let map = new Map();

export async function addAI(name) {
	if (!name)
		throw new Error("Both name and AI instance are required.");

	if (map.has(name))
		throw new Error(`AI with name ${name} already exists.`);
	console.log(`Adding AI with name: ${name}`);
	const ai = new ia.AI(name);
	await ai.start();

	map.set(name, ai);
}

export function deleteAI(name) {
	if (!map.has(name))
		return;

	const ai = map.get(name);
	ai.stopAI();

	map.delete(name);
}