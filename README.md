# AFLA_Discord_Bot
--- Important ---
The bot is currently Hardcoded. If you want to use it, replace the const variables that are towards the begening of the bot.js file.
also an '.env' file is reqired for the bot to function (bot token is there). Create the file with the following structure and put your bot info in corresponding feild:
APP_ID=''
DISCORD_TOKEN=''
PUBLIC_KEY=''
--- End ---

The AFLA bot is a discord bot with curently 4 main features.
-Multi Server Announcement:     It allow the bot to repeate a message that is typed in a specific channel into the sub discord's announcement channel. Currently a announcement channel for admin and users is configured.
-Help Message:    When in the specified channel, you can type commands in there to alter how the bot act. (currently only the command help is programmed. More will be added as the bot updates)
-React Role:    let's users react to a specific message and add or subtract role to the user that reacted
-Auto Voice Channel:    Automaticly make a new voice channel when a user join a designated voice channel and moves them to it. It will also delete the channel when the last person leaves the voice channel. This is useful when a server want to keep the number of voice channel to a minimum.
