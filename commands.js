export const commands = [
    {
        "function": (res, _) => {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                // Fetches a random emoji to send from a helper function
                content: 'hello world ' + getRandomEmoji(),
                },
            });
        },
        "description": "ping pong",
        "type": 1,
        "name": "ping"
    },
    {
        "function": (res, req) => {
            
        },
        "options": [
            {
                "type": 4, // INTEGER
                "name": "amount",
                "name_localizations": {
                    "ko": "량"
                },
                "description": "Amount to bet (if none, all in)",
                "discription_localizations": {
                    "ko": "도박할 량 (선택 안하면 올인)"
                },
                "required": false,
            }
        ],
        "name": "bet",
        "name_localizations": {
            "ko": "도박"
        },
        "dm_permission": false
    }
];