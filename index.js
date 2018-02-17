const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const token = config.token;
const fs = require("fs");
const prefix = config.prefix;


function generateRandomStatus(){
var status = ['version: 2.0.1', 'type c.help to see the commands', 'do not forget to check the #rules', 'have a nice day!', 'enjoy your stay!'];
var randomStatus = status[Math.floor(Math.random() * status.length)];
return randomStatus;
}    
setInterval(function(){ client.user.setActivity(generateRandomStatus());}, 20000);
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
        
    
    
        
    
    
    
    
});


client.on('message', message => {

    commands = ['kick', 'ban', 'purge', 'mal', 'nick', 'role', '8ball', 'avatar', 'remindme', 'help', 'ping-bot'];
    for (i = 0; i < commands.length; i++) {
        if (message.content.startsWith(prefix + commands[i]) && commands[i] == "kick") {
            var personToKick = message.mentions.members.first();
            if (message.member.hasPermission("KICK_MEMBERS")) {
                personToKick.kick();
                message.reply(`${personToKick} has been kicked.`);
            } else {
                message.reply("You can't do that.");
            }
        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "ban") {
            var personToBan = message.mentions.members.first();
            if (message.member.hasPermission("BAN_MEMBERS")) {
                personToBan.ban();
                message.reply(`${personToBan} has been banned.`);
            } else {
                message.reply("You can't do that.");
            }
        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "purge") {
            if (message.member.hasPermission("MANAGE_MESSAGES")) {
                var args = message.content.split(' ');
                var amountOfMessages = args[1];
                message.channel.bulkDelete(amountOfMessages).then(messages => console.log(`${amountOfMessages.length} have been deleted`));
            } else {
                message.reply("You can't do that.");
            }

        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "mal") {
            var args = message.content.split(' ');
            var malID = args[1];
            var malLink = "https://myanimelist.net/profile/";
            var finalLink = malLink + malID;
            message.reply(finalLink);

        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "nick") {
            var args = message.content.split(' ');
            if (args.length > 1) {
                args.splice(0, 1);
                var nick = args.join(' ');
                //var authorAt = message.mentions.members.first();

                message.member.setNickname(nick).then(user => message.reply(`I hope you like your new nickname: ${nick}`));
            } else {
                message.reply("Your nickname has been reset");
            }


        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "role") {
            var args = message.content.split(' ');
            if (args.length > 1) {
                args.splice(0, 1);
                var role = args.join(' ');
                var roleToAssign = message.guild.roles.find("name", role);
                if (roleToAssign) {
                    message.member.addRole(roleToAssign);
                    message.reply(`I hope you like your new role: ${roleToAssign}`);

                } else {
                    message.reply("I couldn't find the specified role.");
                }
            } else {
                message.reply("You need to specify a role");
            }
        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "8ball") {
            var args = message.content.split(' ');
            if (args.length > 1) {
                var answers = [
                    'No.', 'Maybe.', 'Yes.', 'Hmmmmmmmm.', 'Let me think......Nope.', 'Probably.',
                    'Def sure about that.',
                    'Only you can decide.', 'What kind of question is that?', 'Most possibly', 'I am not sure about that.',
                    'Hell yeah.', 'kys', 'I dunno. That\'s a good question.', 'Heh'
                ];
                args.splice(0, 1);
                var question = args.join(' ');
                var botAnswer = answers[Math.floor(Math.random() * answers.length)];
                message.reply(`Your question was: '${question}'\nMy answer is: '${botAnswer}'`);

            } else {
                message.reply("You need to ask me something.")
            }

        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "avatar") {
            var userAvatar = message.author.avatarURL;
            message.reply(userAvatar);

        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "reminder") {
            var args = message.content.split(' ');

        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "help") {
            message.channel.send({
                embed: {
                    color: 3447003,
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL
                    },
                    title: "Lain's command list",
                    description: "Current version: __**2.0.0**__\nCommands that require an argument are highlighted like this: **argument**",
                    fields: [{
                            name: ":hammer_pick: Moderation :hammer_pick:",
                            value: "c.kick **@member** : kicks the mentioned user.\nc.ban **@member** : bans the mentioned user\nc.purge **###** : Deletes up to 100 messages."
                        },
                        {
                            name: ":white_check_mark: Commands anyone can use :white_check_mark: ",
                            value: "c.mal **yourMALid**: Sends a link to your MAL profile.\nc.quote : Prints out a random quote\nc.nick **your nickname**(if no argument is specified, it will remove your current nickname): Changes your nickname on this server.\nc.role **your role**: Assigns the role you want(as long as It doesn't require special permissions.)\nc.8ball **your question **: Answers your weirdest questions.\nc.avatar: Sends a direct link to your avatar."
                        },
                        {
                            name: "Others:",
                            value: "c.ping-bot : Sends the bot's ping.\nc.uptime-bot : Prints out bot's uptime.\nc.source **bot/author** : Sends a link to the bot's source code(she's completely open source!) or the author's profile.\nc.remindme **your message ** **time in milliseconds**"
                        },
                        {
                            name: ":telephone_receiver: Support :telephone_receiver:",
                            value: "Add Nadezhda if you need help."
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: client.user.avatarURL,
                        text: client.user.username
                    }
                }
            });
        } else if (message.content.startsWith(prefix + commands[i]) && commands[i] == "ping-bot") {
            message.channel.send("Pinging.....").then(msg => msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`));

        }
    }

});

client.on('guildMemberAdd', member => {
    const channel = member.guild.channels.find('name', 'home');
    const rulesChannel = member.guild.channels.find('name', 'rules');
    const newMemberRole = member.guild.roles.find('name', 'Member');
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}. Don't forget to check the ${rulesChannel}`);
    member.addRole(newMemberRole);

});



client.login(token);