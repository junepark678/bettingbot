import "dotenv/config";
import { InstallGlobalCommands } from "./utils.js";
import { commands } from "./commands.js";

// commands.forEach(element => {
//     delete element["toRunfunction"]
// });

InstallGlobalCommands(process.env.APP_ID, commands);
