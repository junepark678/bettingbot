import {
  APIApplicationCommandOption,
  ApplicationCommandType,
  LocalizationMap,
  Snowflake,
  Permissions,
  APIEmbed,
  AllowedMentionsTypes,
  MessageFlags,
  APIMessageComponent,
  APIAttachment
} from "discord-api-types/v10";

export interface APIApplicationCommandOptional {
  /**
   * Unique id of the command
   */
  id?: Snowflake;
  /**
   * Type of the command
   */
  type: ApplicationCommandType;
  /**
   * Unique id of the parent application
   */
  application_id: Snowflake;
  /**
   * Guild id of the command, if not global
   */
  guild_id?: Snowflake;
  /**
   * 1-32 character name; `CHAT_INPUT` command names must be all lowercase matching `^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$`
   */
  name: string;
  /**
   * Localization dictionary for the name field. Values follow the same restrictions as name
   */
  name_localizations?: LocalizationMap | null;
  /**
   * The localized name
   */
  name_localized?: string;
  /**
   * 1-100 character description for `CHAT_INPUT` commands, empty string for `USER` and `MESSAGE` commands
   */
  description: string;
  /**
   * Localization dictionary for the description field. Values follow the same restrictions as description
   */
  description_localizations?: LocalizationMap | null;
  /**
   * The localized description
   */
  description_localized?: string;
  /**
   * The parameters for the `CHAT_INPUT` command, max 25
   */
  options?: APIApplicationCommandOption[];
  /**
   * Set of permissions represented as a bitset
   */
  default_member_permissions?: Permissions | null;
  /**
   * Indicates whether the command is available in DMs with the app, only for globally-scoped commands. By default, commands are visible
   */
  dm_permission?: boolean;
  /**
   * Whether the command is enabled by default when the app is added to a guild
   *
   * If missing, this property should be assumed as `true`
   *
   * @deprecated Use `dm_permission` and/or `default_member_permissions` instead
   */
  default_permission?: boolean;
  /**
   * Indicates whether the command is age-restricted, defaults to `false`
   */
  nsfw?: boolean;
  /**
   * Autoincrementing version identifier updated during substantial record changes
   */
  version?: Snowflake;
}

export interface APIInteractionResponseObjectMessage {
    tts?: boolean;
    content?: string;
    embeds?: APIEmbed[];
    allowed_mentions?: AllowedMentionsTypes;
    flags?: MessageFlags;
    components?: APIMessageComponent[];
    attachments?: APIAttachment[];
}