import { PrismaClient, User } from "@prisma/client";
import {
  tryGetUser,
  getRandomInt,
  makeCombid,
  DiscordRequest,
} from "./utils.js";
import { InteractionResponseType } from "discord-interactions";
import { Routes, APIUser, APIChatInputApplicationCommandInteraction, APIButtonComponentWithCustomId, ComponentType, MessageFlags } from "discord-api-types/v10";
import { Request, Response } from "express";
import {
  APIApplicationCommandOptional,
  ToSendType,
} from "./types.js";

type CommandType = {
  commanddata: APIApplicationCommandOptional;
  toRunfunction: (
    res: Response,
    req: Request,
    prisma: PrismaClient
  ) => Promise<Response<any, Record<string, any>>>;
};



export const commands: CommandType[] = [
  {
    toRunfunction: async (
      res: Response,
      req: Request,
      prisma: PrismaClient
    ) => {
      const { guild_id, member, id, data, locale, token } = req.body;
      DiscordRequest(Routes.interactionCallback(id, token), {
        body: {
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
        method: "POST",
      });

      const user = await tryGetUser(prisma, member["user"]["id"], guild_id);

      let tosend: ToSendType;

      let amount: BigInt = 0n;

      if (data["options"] === undefined) {
        amount = user.balance;
      } else {
        let tmpamount: string = data["options"][0]["value"];

        try {
          amount = BigInt(tmpamount);
        } catch (e) {
          console.log(e);
          if (locale == "ko") {
            tosend = {
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                embeds: [
                  {
                    title: "숫자가 아니다.",
                    description: "유저는 숫자가 아닌 것을 요청 하셨습니다.",
                    color: 15548997, // Red 	15548997 	#ED4245
                  },
                ],
              },
            };
          }
          tosend = {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [
                {
                  title: "Not a number",
                  description: "That is not a number!",
                  color: 15548997, // Red 	15548997 	#ED4245
                },
              ],
            },
          };
          DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
            body: tosend["data"],
            method: "POST",
          });
          return res.send(tosend);
        }
      }

      if (BigInt(user.balance.toString()) < BigInt(amount.toString())) {
        if (locale == "ko") {
          tosend = {
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: [
                {
                  title: "잔액이 부족합니다.",
                  description: `현재 잔액은: ${user.balance}원 이지만, 유저는 ${amount}를 요청하셨습니다.`,
                  color: 15548997, // Red 	15548997 	#ED4245
                },
              ],
            },
          };
        }
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "Not enough money",
                description: `Current balance: ${user.balance}, Requested Bet Amount: ${amount}`,
                color: 15548997, // Red 	15548997 	#ED4245
              },
            ],
          },
        };
        DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
          body: tosend["data"],
          method: "POST",
        });
        return res.send(tosend);
      }
      let mult = getRandomInt(2) + 1;
      let plusminus = Math.random() < 0.3 ? -0.5 : 1; // 30%

      const clamp = (num: number, min: number, max: number) =>
        Math.min(Math.max(num, min), max);

      let final = clamp(mult * plusminus, -0.5, 3) * user.multiplier;

      let amountToSet = BigInt(
        Math.ceil(Number.parseInt(amount.toString()) * final)
      );

      if (locale == "ko") {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "도박 **성공**",
                description: `현재 잔액은: ${
                  user.balance + amountToSet
                }원, 도박량: ${final + 1}배`,
                color: 2067276, // DarkGreen 	2067276 	#1F8B4C
              },
            ],
          },
        };
      } else {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "Bet **Success**",
                description: `Current Balance:  ${
                  user.balance + amountToSet
                } KRW, Multiplier: ${final + 1}x`,
                color: 2067276, // DarkGreen 	2067276 	#1F8B4C
              },
            ],
          },
        };
      }

      DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
        body: tosend["data"],
        method: "POST",
      });

      await prisma.user.update({
        where: { combid: makeCombid(member.user.id, guild_id) },
        data: {
          balance: {
            increment: amountToSet,
          },
        },
      });

      return res.send(tosend);
    },
    commanddata: {
      options: [
        {
          type: 4, // INTEGER
          name: "amount",
          name_localizations: {
            ko: "량",
          },
          description: "Amount to bet (if none, all in)",
          description_localizations: {
            ko: "도박할 량 (선택 안하면 올인)",
          },
          required: false,
        },
      ],
      name: "bet",
      name_localizations: {
        ko: "도박",
      },
      dm_permission: false,
      type: 1,
      application_id: "1067953331701551135",
      description: "Bet money to be multiplied",
      description_localizations: {
        ko: "도박을 한다.",
      },
    },
  },
  {
    toRunfunction: async (res, req, prisma: PrismaClient) => {
      const { guild_id, member, id, data, locale, token } = req.body;

      DiscordRequest(Routes.interactionCallback(id, token), {
        body: {
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
        method: "POST",
      });

      let user: User;
      let usernameanddiscrim: string;

      if (data["options"] === undefined) {
        user = await tryGetUser(prisma, member["user"]["id"], guild_id);
        usernameanddiscrim = `${member["user"]["username"]}#${member["user"]["discriminator"]}`;
      } else {
        user = await tryGetUser(prisma, data["options"][0]["value"], guild_id);
        let { username, discriminator } = (await (
          await DiscordRequest(Routes.user(data["options"][0]["value"]), {
            method: "GET",
          })
        ).json()) as APIUser;
        usernameanddiscrim = `${username}#${discriminator}`;
      }

      let tosend: ToSendType;

      if (locale == "ko") {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `${usernameanddiscrim}의 잔액`,
                description: `${usernameanddiscrim}의 잔액은 ${user.balance}원 입니다.`,
                color: 2067276, // DarkGreen 	2067276 	#1F8B4C
              },
            ],
          },
        };
      } else {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `${usernameanddiscrim}'s balance`,
                description: `${usernameanddiscrim}'s balance is ${user.balance} KRW`,
                color: 2067276, // DarkGreen 	2067276 	#1F8B4C
              },
            ],
          },
        };
      }

      DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
        body: tosend["data"],
        method: "POST",
      });

      return res.send(tosend);
    },
    commanddata: {
      options: [
        {
          type: 6, // USER
          name: "target",
          name_localizations: { ko: "유저" },
          description: "Target to check balance on",
          description_localizations: { ko: "잔액을 확인할 유저" },
          required: false,
        },
      ],
      name: "balance",
      name_localizations: {
        ko: "잔액",
      },
      application_id: "1067953331701551135",
      type: 1,
      description: "Get you or somebody else's balance",
      description_localizations: {
        ko: "나 또는 다른 사람의 잔액을 확인",
      },
    },
  },
  {
    toRunfunction: async (
      res: Response,
      req: Request,
      prisma: PrismaClient
    ) => {
      const { guild_id, id, data, locale, token } = req.body;
      DiscordRequest(Routes.interactionCallback(id, token), {
        body: {
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
        },
        method: "POST",
      });
      let tosend: ToSendType;
      let target: string = "";
      let amount: string = "";
      for (let index = 0; index < data["options"].length; index++) {
        const element = data["options"][index];
        if (element["name"] === "target") {
          target = element["value"];
        } else {
          amount = element["value"];
        }
      }

      await tryGetUser(prisma, target, guild_id);

      await prisma.user.update({
        where: { combid: makeCombid(target, guild_id) },
        data: {
          balance: {
            increment: BigInt(amount),
          },
        },
      });
      if (locale === "ko") {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: "성공!",
              },
            ],
          },
        };
      }
      tosend = {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [
            {
              title: "Done!",
            },
          ],
        },
      };

      DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
        body: tosend["data"],
        method: "POST",
      });

      return res.send(tosend);
    },
    commanddata: {
      options: [
        {
          type: 6, // USER
          name: "target",
          name_localizations: { ko: "유저" },
          description: "Target to give money to",
          description_localizations: { ko: "돈을 줄 유저" },
          required: true,
        },
        {
          type: 4, // INTEGER
          name: "amount",
          name_localizations: { ko: "수량" },
          description: "Amount of money to generate",
          description_localizations: { ko: "돈을 줄 량" },
          required: true,
        },
      ],
      name: "mint",
      name_localizations: {
        ko: "조폐국",
      },
      description: "Create an arbitary amount of money",
      description_localizations: {
        ko: "조폐한다.",
      },
      type: 1,
      application_id: "1067953331701551135",
      default_member_permissions: "8", // ADMINISTRATOR (editable)
    },
  },
  {
    toRunfunction: async (res, req, prisma) => {
      const { guild_id, id, member, locale, token } = req.body as APIChatInputApplicationCommandInteraction;
      DiscordRequest(Routes.interactionCallback(id, token), {
        body: {
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          flags: MessageFlags.Ephemeral
        },
        method: "POST",
      });

      let tosend: ToSendType;

      let user = await tryGetUser(prisma, member.user.id, guild_id);

      let usernameanddiscrim = `${member["user"]["username"]}#${member["user"]["discriminator"]}`;

      let userlevel = Number.parseInt(user.level.toString());
      
      let price = Math.pow(10, userlevel) * userlevel;

      await prisma.store.create({
        data: {
          iid: BigInt(id),
          token: token
        }
      })

      if (locale === "ko") {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `${usernameanddiscrim}의 상점`,
                description: `현재 래밸: ${userlevel}, 배량: ${user.multiplier}`,
              }
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: ComponentType.Button,
                    custom_id: `store_levelup_${member.user.id}_${id}`,
                    label: `레벨업! (${price}원)`,
                    style: 1,
                    disabled: BigInt(price) > user.balance
                  } as APIButtonComponentWithCustomId,
                ]
              }
            ],
            flags: MessageFlags.Ephemeral
          }
        }
      }
      else {
        tosend = {
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            embeds: [
              {
                title: `${usernameanddiscrim}'s Store`,
                description: `Current level: ${userlevel}, Multiplier: ${user.multiplier}`,
              }
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: ComponentType.Button,
                    custom_id: `store_levelup_${member.user.id}_${id}`,
                    label: `Level Up! (${price} KRW)`,
                    style: 1,
                    disabled: BigInt(price) > user.balance
                  } as APIButtonComponentWithCustomId,
                ]
              }
            ],
            flags: MessageFlags.Ephemeral
          }
        }
      }

      DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
        body: tosend["data"],
        method: "POST",
      });

      return res.send(tosend)

    },
    commanddata: {
      type: 1,
      application_id: process.env.APP_ID!,
      name: "shop",
      name_localizations: {
        ko: "상점",
      },
      description: "Buy upgrades!",
      description_localizations: {
        ko: "업그래이드를 살 수 있다",
      },
    },
  },
];
