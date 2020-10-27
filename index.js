const Discord = require("discord.js");
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

function noPermissions (message) 
{
    message.reply("you don't have permissions to use this command!");
}

console.log("Starting up...");

client.on('warn', info =>
{
    console.log(`Client warning: ${info}`);
});

client.on('error', info =>
{
    console.log(`Client error: ${error}`);
});

client.on('ready', () => 
{
    console.log("");
    console.log("==================================");
    console.log(` Logged in as ${client.user.tag}!`);
    console.log("==================================");

    client.user.setPresence({
        status: "online",
        activity: {
            name: "!faq",
            type: "PLAYING"
        }
    });
});

const messageCB = require("./discord/message.js").factory;
const reactCB = require("./discord/react.js").factory;

client.on("message", messageCB(client));
client.on("messageReactionAdd", reactCB(client));
client.login(require("./config.json").BOT_TOKEN);