const fs = require("fs");
const utils = require("./utils.js");
let faq = require("../faq.json");

const prefix = "!tubby";

function noPermissions (message) 
{
    message.reply("you don't have permissions to use this command!");
}

function saveFaq (key) 
{
    fs.writeFile('faq.json', JSON.stringify(faq, null, 4), () => {});
    console.log("FAQ was saved! Latest key is: " + key);
}

function handleMessage (client, message)
{
    if (message.author.bot)
    {
        return;
    }

    if (message.mentions.has(message.guild.ownerID) && message.author.id !== message.guild.ownerID)
    {
        var m = utils.getMessage(message.channel, 'dont_ping');

        message.reply(m.replace('%MESSAGE%', message.toString()));
        message.delete();

        return;
    }

    var content = message.content;

    /* Shortcuts */
    if (faq.hasOwnProperty(content.substring(1)))
    {
        content = "!faq " + content.substring(1);
    }

    if (content.startsWith("!faq"))
    {
        content = prefix + " faq" + content.substring(4);
    }

    if (content.startsWith("!set"))
    {
        content = prefix + " set" + content.substring(4);
    }

    if (content.startsWith("!="))
    {
        content = prefix + " set" + content.substring(2);
    }

    if (content.startsWith("!rem"))
    {
        content = prefix + " remove" + content.substring(4);
    }

    if (content.startsWith("!-"))
    {
        content = prefix + " remove" + content.substring(2);
    }

    if (!content.startsWith(prefix))
    {
        return;
    }

    const commandBody = content.slice(prefix.length + 1);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    // console.log(`Message received: ${content}`);
    // console.log(`Command: ${command}, Arguments: ${args}`);

    if (command === "hi")
    {
        const emoji = utils.getEmoji(client, "thinking_cool");

        message.channel.send(`Sup... I'm the Tubby BOT:tm:! I was made by McHorse. ${emoji}`);
    }
    else if (command === "faq")
    {
        if (args.length >= 1)
        {
            const emoji = utils.getEmoji(client, "catblob_sipping_juice");
            const key = args[0].toLowerCase();

            if (faq.hasOwnProperty(key))
            {
                message.channel.send(faq[key]);
            }
            else
            {
                message.channel.send(`An FAQ named \`${key}\` doesn't exist! ${emoji}`);
            }
        }
        else
        {
            var keys = Object.keys(faq);

            if (keys.length == 0)
            {
                keys = "none...";
            }
            else
            {
                keys.sort();
                
                keys = keys.map(elem => "`" + elem + "`");
                keys = keys.join(", ");
            }

            message.channel.send(`Following FAQ entries are available: ${keys}`);
        }
    }
    else if (command === "set" && args.length >= 2)
    {
        if (message.member.hasPermission('ADMINISTRATOR'))
        {
            const key = args.shift().toLowerCase();

            if (faq.hasOwnProperty(key))
            {
                message.reply(`FAQ entry \`${key}\` was replaced!`);
            }
            else
            {
                message.reply(`FAQ entry \`${key}\` was created!`);
            }

            faq[key] = args.join(" ");

            saveFaq(key);
        }
        else
        {
            noPermissions(message);
        }
    }
    else if (command === "remove" && args.length >= 1)
    {
        if (message.member.hasPermission('ADMINISTRATOR'))
        {
            const key = args[0].toLowerCase();

            if (faq.hasOwnProperty(key))
            {
                delete faq[key];

                saveFaq(key);

                message.reply(`FAQ entry \`${key}\` was successfully removed!`);
            }
            else
            {
                message.reply(`FAQ entry \`${key}\` doesn't exist!`);
            }
        }
        else
        {
            noPermissions(message);
        }
    }
}

exports.factory = (client) =>
{
    return (message) => handleMessage(client, message);
};