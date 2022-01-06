const mudyID = "787388198971375636";

function isMudy(author)
{
    return author.id == mudyID;
}

function handleMessageDel(client, message) 
{
    var author = message.author;
    
    if (isMudy(author) == false)
    {
        return;
    }

    var channel = message.channel;
    var content = message.content;

    channel.send("Муди, дастал удалять сообщения, хд хд хд");
    channel.send("Удаленное сообщение: \n" + content);
}

exports.factory = (client) => 
{
    return (message) => handleMessageDel(client, message);
};