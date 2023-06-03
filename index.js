import 'dotenv/config';
import express from 'express';
import { InteractionType, InteractionResponseType, } from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';
import { commands } from './commands.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
console.log('Connected to Prisma!');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));
app.post('/interactions', async function (req, res) {
    const { type, id, data } = req.body;
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        let return_value = null;
        for (let index = 0; index < commands.length; index++) {
            const element = commands[index];
            if (element.name == name) {
                return_value = await element.toRunfunction(res, req, prisma);
            }
        }
        return return_value;
    }
});
app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
//# sourceMappingURL=index.js.map