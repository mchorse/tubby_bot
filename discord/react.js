const utils = require('./utils.js');
const lang = require("./lang.json");

function handleReaction (client, message, user)
{
	const emoji = message.emoji.toString();
    const mc_horse = utils.getEmoji(client, "mc_horse").toString();

    if (emoji === "❓")
    {
        message.message.reply(lang[utils.getLocale(message.message.channel)]['ask_help']);
    }
    else if (emoji === "❗")
    {
        message.message.reply(lang[utils.getLocale(message.message.channel)]['just_ask']);
    }
    else if (emoji === "❌" && message.message.member.id === client.user.id)
    {
        message.message.delete();
    }

    // console.log(`Emoji is "${emoji}" from ${message.message.member.toString()}.`);
}

exports.factory = (client) => 
{
	return (message, user) => handleReaction(client, message, user);
};