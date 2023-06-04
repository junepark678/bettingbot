import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
import { commands } from "./commands.js";
import { APIApplicationCommandOptional } from "./types.js";

// commands.forEach(element => {
//     delete element["toRunfunction"]
// });

let CommandData: APIApplicationCommandOptional[];

for (const iterator of commands) {
    CommandData.push(iterator.commanddata)
}

InstallGlobalCommands(process.env.APP_ID, CommandData);
