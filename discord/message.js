const fs = require("fs");
const utils = require("./utils.js");

class Words
{
    constructor(id, file)
    {
        this.id = id;
        this.file = file;
        this.strings = require(`../${file}`);
    }

    save(key)
    {
        fs.writeFile(this.file, JSON.stringify(this.strings, null, 4), () => {});
        console.log(`${this.id} was saved! Latest key is: ${key}`);
    }

    has(key)
    {
        key = key.trim().toLowerCase();

        return this.strings.hasOwnProperty(key);
    }

    get(key, emoji) 
    {
        key = key.trim().toLowerCase();

        if (this.has(key))
        {
            return this.strings[key];
        }
        
        return `An FAQ named \`${key}\` doesn't exist! ${emoji}`;
    }

    put(key, value)
    {
        key = key.trim().toLowerCase();

        let had = this.has(key);

        this.strings[key] = value;
        this.save(key);

        return had;
    }

    remove(key)
    {
        key = key.trim().toLowerCase();

        if (this.has(key))
        {
            delete this.strings[key];

            this.save(key);

            return true;
        }

        return false;
    }
}

let faq = new Words("FAQ", "faq.json");
let responses = new Words("Responses", "responses.json");

const prefix = "!tubby";

let localVotes = [];

function noPermissions(message) 
{
    message.reply("you don't have permissions to use this command!");
}

function processInvidual(client, message, matches) 
{
    const emoji = utils.getEmoji(client, "catblob_sipping_juice");

    if (matches && matches.length > 0)
    {
        var key = matches.shift();
        var promise = message.channel
            .send(eh(key, faq.get(key, emoji)))
            .catch(() => console.error("Error during creation of the poll..."));

        matches.forEach((key) => 
        {
            promise.then(() => message.channel.send(eh(key, faq.get(key)), emoji));
        });
    }
}

function eh(key, message)
{
    return `> *FAQ entry for* \`!${key}\`*:*\n${message}`;
}

function handleMessage(client, message)
{
    if (message.author.bot)
    {
        return;
    }

    var content = message.content;

    if (responses.has(content))
    {
        return message.channel.send(responses.get(content).replace(/{user}/g, "<@" + message.author.id + ">"));
    }

    var index = content.indexOf("!");

    if (index > 0)
    {
        return processInvidual(client, message, content.match(/((?<=[^@]\!)[\w\d\-]+)/ig));
    }

    /* Shortcuts */
    if (faq.has(content.substring(1)))
    {
        content = "!faq " + content.substring(1);
    }

    if (content.startsWith("!faq"))
    {
        content = prefix + " faq" + content.substring(4);
    }

    if (content.startsWith("!ar"))
    {
        content = prefix + " ar" + content.substring(3);
    }

    if (content.startsWith("!set"))
    {
        content = prefix + " faq set" + content.substring(4);
    }

    if (content.startsWith("!="))
    {
        content = prefix + " faq set" + content.substring(2);
    }

    if (content.startsWith("!rem"))
    {
        content = prefix + " faq remove" + content.substring(4);
    }

    if (content.startsWith("!-"))
    {
        content = prefix + " faq remove" + content.substring(2);
    }

    if (!content.startsWith(prefix))
    {
        return;
    }

    const commandBody = content.slice(prefix.length + 1).trim();
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    console.log(`Message received: ${content}`);
    console.log(`Command: ${command}, Arguments: ${args}`);

    if (command === "hi")
    {
        const emoji = utils.getEmoji(client, "thinking_cool");

        message.channel.send(`Sup... I'm the Tubby BOT:tm:! I was made by McHorse. ${emoji}`);
    }
    else if (command === "faq" || command === "ar")
    {
        if (args.length >= 1)
        {
            return processInvidual(client, message, [args[0]]);
        }
        else if (args.length == 0)
        {
            var keys = Object.keys(faq.strings);
            var messages = [];
            var separator = ", ";

            if (keys.length == 0)
            {
                keys = "none...";
            }
            else
            {
                keys.sort();
                
                var m = keys.map(elem => "` " + elem + " `").join(separator);

                m = `Following FAQ entries are available: ${m}`;
                messages.push(m);
            }

            while (messages[messages.length - 1].length >= 2000)
            {
                var m = messages[messages.length - 1];
                var i = m.lastIndexOf(separator);

                while (i >= 2000)
                {
                    i = m.lastIndexOf(separator, i - 1);
                }

                var first = m.substring(0, i);
                var second = m.substring(i + separator.length);

                messages[messages.length - 1] = first;
                messages.push(second);
            }

            for (const m of messages)
            {
                message.channel.send(m);
            }

            return;        
        }

        if (!message.member.hasPermission('ADMINISTRATOR'))
        {
            return noPermissions(message);
        }

        let subcommand = args.shift();
        let words = command === "faq" ? faq : responses;
        const key = args.shift();

        if (subcommand === "set" && args.length >= 1)
        {
            if (words.put(key, args.join(" ")))
            {
                message.reply(`${words.id} entry \`${key}\` was replaced!`);
            }
            else
            {
                message.reply(`${words.id} entry \`${key}\` was created!`);
            }
        }
        else if (subcommand === "remove")
        {
            if (words.remove(key))
            {
                message.reply(`${words.id} entry \`${key}\` was successfully removed!`);
            }
            else
            {
                message.reply(`${words.id} entry \`${key}\` doesn't exist!`);
            }
        }
    }
}

exports.factory = (client) =>
{
    return (message) => handleMessage(client, message);
};