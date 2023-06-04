import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";
import { PrismaClient, User } from "@prisma/client";
import { Request, Response } from "express";
import { APIApplicationCommandOptional } from "./types.js";

export function VerifyDiscordRequest(clientKey: string) {
  return function (req: Request, res: Response, buf: Buffer, encoding: any) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function DiscordRequest(endpoint: string, options: any) {
  // append endpoint to root API URL
  const url = "https://discord.com/api/v10/" + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent":
        "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
    },
    ...options,
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId: number | string, commands: APIApplicationCommandOptional[]) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: "PUT", body: commands });
  } catch (err) {
    console.error(err);
  }
}

export function makeCombid(userid: string, serverid: string): string {
  return btoa(`${userid},${serverid}`);
}

export function parseCombid(combid: string): Object {
  let undone = atob(combid).split(",");
  let uid = undone[0];
  let serverid = undone[1];
  return { userid: uid, serverid: serverid };
}

export async function tryGetUser(
  prisma: PrismaClient,
  id: string,
  guild_id: string
): Promise<User> {
  let user;

  user = prisma.user.upsert({
    where: { combid: makeCombid(id, guild_id) },
    update: {},
    create: { combid: makeCombid(id, guild_id), balance: 50000 },
  });

  return user;
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
