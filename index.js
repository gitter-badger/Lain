const Discord = require("discord.js");
const yt = require('ytdl-core');
const client = new Discord.Client();


const config = require("./config.json");

const adminID = config.adminID;
const modID = config.modID;
const token = config.token;
const fs = require("fs");


client.on('ready', () => {
	console.log('Ready!');
	client.user.setActivity("c.help | v1.5.0");

});
prefix = config.prefix;

client.on('message', message => {
	
	var queue = {};
	
	const commands = {
		'play': (message) => {
            if (queue[message.guild.id] === undefined) return message.channel.sendMessage(`Add some songs to the queue first with ${prefix}add`);
            if (!message.guild.voiceConnection) return commands.join(message).then(() => commands.play(message));
            if (queue[message.guild.id].playing) return message.channel.sendMessage('Already Playing');
            let dispatcher;
            queue[message.guild.id].playing = true;

            console.log(queue);
            (function play(song) {
                console.log(song);
                if (song === undefined) return message.channel.sendMessage('Queue is empty').then(() => {
                    queue[message.guild.id].playing = false;
                    message.member.voiceChannel.leave();
                });
                message.channel.sendMessage(`Playing: **${song.title}** as requested by: **${song.requester}**`);
                dispatcher = message.guild.voiceConnection.playStream(yt(song.url, {
                    audioonly: true
                }), {
                        passes: passes
                    });
                let collector = message.channel.createCollector(message => message);
                collector.on('message', message => {
                    if (message.content.startsWith(prefix + 'pause')) {
                        message.channel.sendMessage('paused').then(() => {
                            dispatcher.pause();
                        });
                    } else if (message.content.startsWith(prefix + 'resume')) {
                        message.channel.sendMessage('resumed').then(() => {
                            dispatcher.resume();
                        });
                    } else if (message.content.startsWith(prefix + 'skip')) {
                        message.channel.sendMessage('skipped').then(() => {
                            dispatcher.end();
                        });
                    } else if (message.content.startsWith('volume+')) {
                        if (Math.round(dispatcher.volume * 50) >= 100) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                        dispatcher.setVolume(Math.min((dispatcher.volume * 50 + (2 * (m.content.split('+').length - 1))) / 50, 2));
                        message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                    } else if (message.content.startsWith('volume-')) {
                        if (Math.round(dispatcher.volume * 50) <= 0) return message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                        dispatcher.setVolume(Math.max((dispatcher.volume * 50 - (2 * (m.content.split('-').length - 1))) / 50, 0));
                        message.channel.sendMessage(`Volume: ${Math.round(dispatcher.volume * 50)}%`);
                    } else if (message.content.startsWith(prefix + 'time')) {
                        message.channel.sendMessage(`time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? '0' + Math.floor((dispatcher.time % 60000) / 1000) : Math.floor((dispatcher.time % 60000) / 1000)}`);
                    }
                });
                dispatcher.on('end', () => {
                    collector.stop();
                    play(queue[message.guild.id].songs.shift());
                });
                dispatcher.on('error', (err) => {
                    return message.channel.sendMessage('error: ' + err).then(() => {
                        collector.stop();
                        play(queue[message.guild.id].songs.shift());
                    });
                });
            })(queue[message.guild.id].songs.shift());
        },
        'join': (message) => {
            return new Promise((resolve, reject) => {
                const voiceChannel = message.member.voiceChannel;
                if (!voiceChannel || voiceChannel.type !== 'voice') return message.reply('I couldn\'t connect to your voice channel...');
                voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
            });
        },
        'add': (message) => {
            let url = message.content.split(' ')[1];
            if (url == '' || url === undefined) return message.channel.sendMessage(`You must add a YouTube video url, or id after ${prefix}add`);
            yt.getInfo(url, (err, info) => {
                if (err) return message.channel.sendMessage('Invalid YouTube Link: ' + err);
                if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [];
                queue[message.guild.id].songs.push({
                    url: url,
                    title: info.title,
                    requester: message.author.username
                });
                message.channel.sendMessage(`added **${info.title}** to the queue`);
            });
        },
        'queue': (message) => {
            if (queue[message.guild.id] === undefined) return message.channel.sendMessage(`Add some songs to the queue first with ${prefix}add`);
            let tosend = [];
            queue[message.guild.id].songs.forEach((song, i) => {
                tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`);
            });
            message.channel.sendMessage(`__**${message.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0, 15).join('\n')}\`\`\``);
        },
		'help': (message) => {

			message.channel.send({
				embed: {
					color: 3447003,
					author: {
						name: client.user.username,
						icon_url: client.user.avatarURL
					},
					title: "Lain's command list",
					description: "Current version: __**1.5.0**__\nCommands that require an argument are highlighted like this: **argument**",
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

		},
		'avatar': (message) => {

			message.reply(message.author.avatarURL)
		},
		'purge': (message) => {

			var args = message.content.split(/[ ]+/);
			var amountToDelete = args[1];
			if (amountToDelete < 2) {
				message.reply('Use this command only if you need to delete more than 2 messages, otherwise do it yourself, lazy ass cunt.');
			} else {
				message.channel.fetchMessages({
					limit: amountToDelete++
				}).then(messages => message.channel.bulkDelete(messages));
				console.log(amountToDelete);
				message.channel.sendMessage(`${amountToDelete - 1} messages have been deleted. :wastebasket:`).then(response => response.delete(3000));
			}


		},
        'remindme': (message) =>{
            var args = message.content.split(' ');
            if(args.length > 1){
                args.splice(0, 1);
                //console.log(args);
                function format(timer) {
				function pad(s) {
					return (s < 10 ? '0' : '') + s;
				}
                
                var hours = Math.floor((timer / (60 * 60 * 1000)));
                var minutes = Math.floor(timer / (60 * 1000)) % 60;
                var seconds = Math.floor((timer / 1000) % 60);
				return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
                }
                //var msg = args[0];
                var timer = args.filter(function (item) {
                    return (parseInt(item) == item);
                });
                
                message.channel.send({
				embed: {
					color: 3447003,
					description: "I'll remind you in  " + "**" + format(timer) + "**"
				}
                });
                setTimeout(function(){ message.reply("Hey, you asked me to remind you something!" + '\n' + ' ' + 'in ' + format(timer) + '' ); }, timer);
                
                
            }
            },
		'role': (message) => {

			var args = message.content.split(' ');
			if (args.length > 1) {
				args.splice(0, 1);
				var role = args.join(' ');
				var roleToAssign = message.guild.roles.find("name", role);
				if (roleToAssign) {
					message.member.addRole(roleToAssign);
					message.reply("Done.");

				} else {
					message.reply("I couldn't find the specified role. Make sure you didn't make any typo.");
				}


			} else {
				message.reply('You need to specify a role.');
			}
		},
		'8ball': (message) => {
			var question_array = message.content.split(' ');
			if (question_array.length > 1) {
				question_array.splice(0, 1);
				var question = question_array;
				var question_string = question.join(' ');
				var answers = [
					'vro 😳', 'No.', 'Maybe.', 'Yes.', 'Hmmmmmmmm.', 'Let me think......Nope.', 'Probably.',
					'Def sure about that.',
					'Only you can decide.', 'What kind of question is that?', 'Most possibly', 'I am not sure about that.',
					'Hell yeah.'
				];
				var bot_answer = answers[Math.floor(Math.random() * answers.length)];
				message.reply("Your question was: " + "`" + question_string + "`" + '\n' + 'My answer is: ' + "`" + `${bot_answer}` + "`");
			} else {
				message.reply("You need to ask me a question.");
			}

		},
		'ban': (message) => {
			var personToBan = message.mentions.members.first();
			if (message.member.hasPermission("BAN_MEMBERS")) {
				personToBan.ban();
				message.reply(`${personToBan} has been banned.`);
			} else {
				message.reply('You cannot do that.');
			}
		},
		'kick': (message) => {
			var personToKick = message.mentions.members.first();
			if (message.member.hasPermission("KICK_MEMBERS")) {
				personToKick.kick();
				message.reply(`${personToKick} has been kicked.`);
			} else {
				message.reply('You cannot do that.');
			}
		},
		'nick': (message) => {

			var msg = message.content.split(' ');
			if (msg.length > 1) {
				msg.splice(0, 1);
				var nick = msg.join(' ');
				//var authorAt = message.mentions.members.first();

				message.member.setNickname(nick).then(user => message.reply(`I hope you like your new nickname: ${nick}`));
			} else {
				message.reply("Your nickname has been reset");
			}


		},
		///for bot owner only
		'status': (message) => {
			if (message.author.id == adminID || message.author.id == modID) {
				var msg = message.content.split(' ');
				msg.splice(0, 1);
				var status = msg.join(' ');
				client.user.setGame(status);
				message.reply("done.");
			} else {
				message.reply("you can't do that.");
			}
		},
		'ping-bot': (message) => {


			message.channel.send("Pinging.....").then(msg => msg.edit(`Pong! Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms.`));


		},
		'mal': (message) => {
			var animeLIST = "https://myanimelist.net/profile/";
			var msg = message.content.split(' ');
			var malID = msg[1];
			message.channel.send(animeLIST + malID);
		},
		'uptime-bot': (message) => {
			function format(seconds) {
				function pad(s) {
					return (s < 10 ? '0' : '') + s;
				}
				var hours = Math.floor(seconds / (60 * 60));
				var minutes = Math.floor(seconds % (60 * 60) / 60);
				var seconds = Math.floor(seconds % 60);

				return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
			}

			var uptime = process.uptime();
			message.channel.send({
				embed: {
					color: 3447003,
					description: "I have been up for " + "**" + format(uptime) + "**"
				}
			});

		},
		'source': (message) => {
			var msg = message.content.split(' ');
			if (msg[1] == 'bot') {
				message.reply("https://github.com/herherher/shinobu");
			} else if (msg[1] == 'author') {
				message.reply("https://github.com/herherher");
			} else {
				message.reply("invalid argument.");
			}
		}


	}



	if (message.content.startsWith("https://discord.gg")) {
		message.member.kick(); //kicking would be more appropriate wouldn't it xd
		message.reply(`Don't post invite links. ${message.member} was kicked.`).then(msg => msg.delete(5000));
	}

	if (commands.hasOwnProperty(message.content.toLowerCase().slice(prefix.length).split(' ')[0])) commands[message.content.toLowerCase().slice(prefix.length).split(' ')[0]](message);
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
