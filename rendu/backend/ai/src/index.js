import { fastify, log } from '../shared/fastify.js';
import { addAI } from './iaManager.js';

fastify.post('/create', async (request, reply) => {
    if (!request.body || typeof request.body.name !== 'string')
        return reply.status(400).send({ error: 'Missing or invalid name.' });
    const name = request.body.name;
    if (!name)
        return reply.status(400).send({ error: 'Name is undefined.' });
    try
    {
        await addAI(name);
        reply.status(200).send(`Created AI game with ${name}.`);
    } catch (err) {
        reply.status(400).send(`Couldn't create AI game with ${name}: ${err.message}`);
    }
});
