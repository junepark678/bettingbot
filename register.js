import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';
import { commands } from './commands.js';
InstallGlobalCommands(process.env.APP_ID, commands);
//# sourceMappingURL=register.js.map