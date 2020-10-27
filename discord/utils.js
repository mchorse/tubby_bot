exports.getEmoji = (client, str) =>
{
    return client.emojis.cache.find(emoji => emoji.name === str);
};

exports.getLocale = (channel) =>
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
};