import "dotenv/config";
import express from "express";
import {
  VerifyDiscordRequest,
} from "./utils.js";
import { commands } from "./commands.js";

import { PrismaClient } from "@prisma/client";

import { InteractionType, InteractionResponseType, APIInteraction } from "discord-api-types/v10";

import { message_components } from "./message_components.js";

const prisma = new PrismaClient();

console.log("Connected to Prisma!");

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body as APIInteraction;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.Ping) {
    return res.send({ type: InteractionResponseType.Pong });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.ApplicationCommand) {
    const { name } = data;

    let return_value: express.Response<any, Record<string, any>> | null = null;

    for (let index = 0; index < commands.length; index++) {
      const element = commands[index];
      if (element.commanddata.name == name) {
        return_value = await element.toRunfunction(res, req, prisma);
      }
    }

    return return_value;
  }

  if (type === InteractionType.MessageComponent) {
    const { custom_id } = data;
    for (const component of message_components) {
      if (custom_id.startsWith(component.name)){
        component.toRunfunction(res, req, prisma)
      }
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
