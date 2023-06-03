import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';
import commands from './commands.js';

delete commands["function"];

InstallGlobalCommands(process.env.APP_ID, commands);