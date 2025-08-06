import { log } from '../shared/fastify.js';
import * as ia from './ai.js';

let map = new Map();

export async function addAI(name) {
	log.debug(map, `Adding AI with name: ${name}`);
	if (!name)
		throw new Error("Both name and AI instance are required.");

	if (map.has(name))
		throw new Error(`AI with name ${name} already exists.`);
	const ai = new ia.AI(name);
	await ai.start();

	map.set(name, ai);
	log.debug(map, `Added AI with name: ${name}`);
}

export function deleteAI(name) {
	log.debug(map, `Deleting AI with name: ${name}`);
	if (!map.has(name))
		return;

	const ai = map.get(name);
	ai.stopAI();

	map.delete(name);
	log.debug(map, `Deleted AI with name: ${name}`);
}