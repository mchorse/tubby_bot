const lang = require("./lang.json");

function getLocale (channel) 
{
    if (channel.name === "русский")
    {
        return "ru";
    }
    else if (channel.name === "português")
    {
        return "pt";
    }
    
    return "en";
}

exports.getEmoji = (client, str) =>
{
    return client.emojis.cache.find(emoji => emoji.name === str);
};

exports.getMessage = (channel, key) =>
{
    let locale = getLocale(channel);

    return lang[locale][key];
};

exports.getLocale = getLocale;