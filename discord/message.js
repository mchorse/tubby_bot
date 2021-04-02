const fs = require("fs");
const utils = require("./utils.js");
let faq = require("../faq.json");

const prefix = "!tubby";

let localVotes = [];

function noPermissions (message) 
{
    message.reply("you don't have permissions to use this command!");
}

function saveFaq (key) 
{
    fs.writeFile('faq.json', JSON.stringify(faq, null, 4), () => {});
    console.log("FAQ was saved! Latest key is: " + key);
}

function getFaqMessage(key, emoji) 
{
    key = key.toLowerCase();

    if (faq.hasOwnProperty(key))
    {
        return faq[key];
    }
    
    return `An FAQ named \`${key}\` doesn't exist! ${emoji}`;
}

function processInvidual(client, message, matches) 
{
    const emoji = utils.getEmoji(client, "catblob_sipping_juice");

    if (matches && matches.length > 0)
    {
        var promise = message.channel
            .send(getFaqMessage(matches.shift(), emoji))
            .catch(() => console.error("Error during creation of the poll..."));

        matches.forEach((key) => 
        {
            promise.then(() => message.channel.send(getFaqMessage(key), emoji));
        });
    }
}

/* I hate promises not only IRL but also in JavaScript... */

function countVotes(client, message, target) 
{
    var promises = [];
    var votes = {};
    var extract = (a, key) => 
    {
        for(const [userKey, userVal] of a)
        {
            var array = votes[userKey];

            if (!array)
            {
                votes[userKey] = [];
                array = votes[userKey];
            }

            array.push({
                username: userVal.username,
                emoji: key
            })
        }
    };

    var promises = [];

    for (const [k, v] of message.reactions.cache)
    {
        promises.push(new Promise((resolve, reject) => 
        {
            v.users.fetch()
                .then((a) => 
                {
                    extract(a, k);
                    resolve();
                })
                .catch(reject);
        }));
    }

    Promise.all(promises)
        .then(() => 
        {
            var emojis = {};

            for (var k in votes)
            {
                var v = votes[k];

                if (!emojis[v[0].emoji])
                {
                    emojis[v[0].emoji] = {
                        username: [v[0].username],
                        votes: 1
                    };
                }
                else
                {
                    emojis[v[0].emoji].username.push(v[0].username)
                    emojis[v[0].emoji].votes += 1;
                }
            }

            localVotes.push(emojis);
            target.delete();
        })
        .catch(console.error);
}

function processVotes(votes)
{
    var emojis = {};

    votes.forEach((v) =>
    {
        for (var k in v)
        {
            var o = v[k];
            var emoji = emojis[k];

            if (!emoji)
            {
                emoji = {
                    username: [].concat(o.username),
                    votes: o.votes
                };
                emojis[k] = emoji;
            }
            else
            {
                emoji.votes += o.votes;

                o.username.forEach((name) =>
                {
                    if (emoji.username.includes(name))
                    {
                        emoji.votes -= 1;
                    }
                });
            }
        }
    });

    var result = [`Votes for ${votes.length} poll messages:`, ""];

    for (var key in emojis)
    {
        result.push(`${key} — ${emojis[key].votes}`);
    }
    
    return result.join("\n");
}

function handleMessage (client, message)
{
    if (message.author.bot)
    {
        return;
    }

    var content = message.content;
    var index = content.indexOf("!");

    if (index > 0)
    {
        return processInvidual(client, message, content.match(/((?<=[^@]\!)[\w\d\-]+)/ig));
    }

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
            processInvidual(client, message, [args[0]]);
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
                
                keys = keys.map(elem => "` " + elem + " `");
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
    else if (command === "count" && args.length >= 1)
    {
        if (args[0] === "process")
        {
            message.reply(processVotes(localVotes));
            localVotes.length = 0;
        }
        else
        {
            message.channel.messages.fetch(args[0])
                .then((m) => countVotes(client, m, message))
                .catch(console.error);
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