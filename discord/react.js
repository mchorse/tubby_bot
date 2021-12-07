const utils = require('./utils.js');

var modsRole = undefined;

function handleReaction (client, message, user)
{
    if (modsRole === undefined)
    {
        var mods = message.message.channel.guild.roles.cache.find(r => r.name === "Mods");

        if (mods)
        {
            modsRole = mods.id;

            console.log("Mods' role ID is " + modsRole);
        }
    }

    let member = message.message.guild.member(user);

    if (!member.hasPermission('ADMINISTRATOR') || member.roles.cache[modsRole] === null)
    {
        return;
    }

    const emoji = message.emoji.toString();

    console.log("User " + user.tag + " reacted " + emoji + " in #" + message.message.channel.name);

    /* Ask in the help channel */
    if (emoji === "❓")
    {
        message.message.reply(utils.getMessage(message.message.channel, 'ask_help'));
    }
    /* Just ask, please! */
    else if (emoji === "❗")
    {
        message.message.reply(utils.getMessage(message.message.channel, 'just_ask'));
    }
    /* Create a poll */
    else if (emoji === '📶')
    {
        let content = message.message.content;
        let emojis = [];
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++)
        {
            let line = lines[i];
            let index = line.indexOf("—");

            if (index !== -1)
            {
                emojis.push(line.substring(0, index).trim());
            }
            else if (emojis.length > 0)
            {
                break;
            }
        }

        if (emojis.length > 0)
        {
            var promise = message.message
                .react(emojis.shift())
                .catch(() => console.error("Error during creation of the poll..."));

            emojis.forEach((emoji) => 
            {
                promise.then(() => message.message.react(emoji));
            });
        }
    }

    // console.log(`Emoji is "${emoji}" from ${message.message.member.toString()}.`);
}

exports.factory = (client) => 
{
	return (message, user) => handleReaction(client, message, user);
};