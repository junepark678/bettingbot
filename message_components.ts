import { PrismaClient } from "@prisma/client";
import { APIButtonComponentWithCustomId, APIMessageComponentInteraction, ComponentType, InteractionResponseType, MessageFlags, Routes } from "discord-api-types/v10";
import { Response, Request } from "express";
import { ToSendType } from "./types.js";
import { DiscordRequest, makeCombid, tryGetUser } from "./utils.js";

type MessageComponentType = {
  toRunfunction: (
    res: Response,
    req: Request,
    prisma: PrismaClient
  ) => Promise<Response<any, Record<string, any>>>;
  name: string;
};

export const message_components: MessageComponentType[] = [
  {
    toRunfunction: async (res, req, prisma) => {
        const { custom_id } = (req.body as APIMessageComponentInteraction).data;
        const { member, locale, id, token, guild_id } = (req.body as APIMessageComponentInteraction)
        let tosend: ToSendType;
        if (custom_id.substring(14, 14+18) !== member.user.id) {
            if (locale === "ko") {
                tosend = {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [{
                            description: "당신 것이 아님니다!"
                        }],
                        flags: MessageFlags.Ephemeral
                    }
                }
            }
            else {
                tosend = {
                    type: InteractionResponseType.ChannelMessageWithSource,
                    data: {
                        embeds: [{
                            description: "That isn't yours!"
                        }],
                        flags: MessageFlags.Ephemeral
                    }
                }
            }
            return res.send(tosend);
        }
        DiscordRequest(Routes.interactionCallback(id, token), {
            body: {
              type: InteractionResponseType.DeferredChannelMessageWithSource,
            },
            method: "POST",
          });
          
        // let interaction = await prisma.store.findFirst({
        //     where: {iid: BigInt(custom_id.substring(14+19))}
        // })
        // if (interaction === undefined||interaction === null) {
        //     if (locale === "ko") {
        //         tosend = {
        //             type: InteractionResponseType.ChannelMessageWithSource,
        //             data: {
        //                 embeds: [{
        //                     description: "존재하지 않은 스토어 입니다!"
        //                 }],
        //                 flags: MessageFlags.Ephemeral
        //             }
        //         }
        //     }
        //     tosend = {
        //         type: InteractionResponseType.ChannelMessageWithSource,
        //         data: {
        //             embeds: [{
        //                 description: "That store doesn't exist!"
        //             }],
        //             flags: MessageFlags.Ephemeral
        //         }
        //     }
        //     DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
        //         body: tosend["data"],
        //         method: "POST",
        //       });
        //     return res.send(tosend);
        // }

        const combid = makeCombid(member.user.id, guild_id);        
        
        const user = await tryGetUser(prisma, member.user.id, guild_id);
        
        let userlevel = Number.parseInt(user.level.toString());
        let price = Math.pow(10, userlevel) * userlevel

        await prisma.user.update({
            where: {
                combid: combid
            },
            data: {
                balance: {
                    decrement: price
                },
                level: {
                    increment: 1
                },
                multiplier: {
                    increment: Math.pow(2, Number.parseFloat(user.level.toString())) * 0.1
                }
            }
        })

        tosend = {
            data: {
                embeds: [
                    {
                        title: (locale === "ko")? "성공" : "Done!"
                    }
                ]
            },
            type: InteractionResponseType.ChannelMessageWithSource
        }

        

        let usernameanddiscrim = `${member["user"]["username"]}#${member["user"]["discriminator"]}`;
        userlevel += 1;
        price = Math.pow(10, userlevel) * userlevel
  
        if (locale === "ko") {
          tosend = {
            type: InteractionResponseType.ChannelMessageWithSource,
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
                      custom_id: `store_levelup_${member.user.id}`,
                      label: `레벨업! (${price}원)`,
                      style: 1,
                      disabled: price > user.balance
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
            type: InteractionResponseType.ChannelMessageWithSource,
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
                      disabled: price > user.balance
                    } as APIButtonComponentWithCustomId,
                  ]
                }
              ],
              flags: MessageFlags.Ephemeral
            }
          }
        }

        // DiscordRequest(Routes.webhook(process.env.APP_ID!, token), {
        //     body: tosend["data"],
        //     method: "POST",
        //   });
        

    },
    name: 'store_levelup_'
  },
];

