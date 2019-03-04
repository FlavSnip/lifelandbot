// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot démaré, avec ${client.users.size} joueurs, avec ${client.channels.size} channels + Catégories. By Flav.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`🌴 Sur ${client.guilds.size} serveurs | !help`, `https://twitch.tv/flavsnipy`);
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`🌴 Sur ${client.guilds.size} serveurs | !help`, `https://twitch.tv/flavsnipy`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`🌴 Sur ${client.guilds.size} serveurs | !help`, `https://twitch.tv/flavsnipy`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Trouvé ! La latence est de ${m.createdTimestamp - message.createdTimestamp}ms. et la latence de l'API est de ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Administrateur", "Moderator"].includes(r.name)) )
      return message.reply("Désolé, Vous n'avez pas la permission !");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Merci de mentionner une personne.");
    if(!member.kickable) 
      return message.reply("Je ne peut pas kick ce joueur !");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "Aucune raison donnée";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Désolé ${message.author} Je ne peut pas kick car : ${error}`));
    message.reply(`${member.user.tag} à été kick par ${message.author.tag} pour : ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("Désolé, Vous n'avez pas la permission !");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Merci de mentionner une personne.");
    if(!member.bannable) 
      return message.reply("Je ne peut pas ban ce joueur.");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "Aucune raison donnée.";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} à été ban par ${message.author.tag} pour : ${reason}`);
  }
  
  if(command === "clear") {
    // This command removes all messages from all users in the channel, up to 100.
    
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Merci de donner un nombre entre <2 et >100 !");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Erreur : ${error}`));
  }

  if(command === "help") {
    var embed = new Discord.RichEmbed()
    .setColor('#27ae60')
    .setThumbnail("https://i.imgur.com/NOckoNC.png")
    .setTitle(`Voici mes commandes :`)
    .addField("!ping",
    "Pour afficher le ping du bot.")
    .addField("!addons",
    "Pour avoir le lien du Workshop.")
    .addField("!forum",
    "Pour avoir le lien du Forum.")
    .addField("!youtube",
    "Pour avoir le lien de la chaine Youtube.")
    .setFooter(`Bot by Flav.`)
    message.channel.sendEmbed(embed);
  }

  if(command === "addons") {
    var embed = new Discord.RichEmbed()
    .setColor('#27ae60')
    .setThumbnail("https://i.imgur.com/NOckoNC.png")

    .setTitle(`Voici le lien du Workshop`)
    .setURL("https://steamcommunity.com/sharedfiles/filedetails/?id=1357093388")
    .setDescription(`:arrow_up:  Clique dessus :arrow_up: `)
    message.channel.sendEmbed(embed);
  }

  if(command === "forum") {
    var embed = new Discord.RichEmbed()
    .setColor('#27ae60')
    .setThumbnail("https://i.imgur.com/NOckoNC.png")

    .setTitle(`Voici le lien du Forum`)
    .setURL("https://lifeland.mistforums.com/")
    .setDescription(`:arrow_up:  Clique dessus :arrow_up: `)
    message.channel.sendEmbed(embed);
  }

  if(command === "youtube") {
    var embed = new Discord.RichEmbed()
    .setColor('#27ae60')
    .setThumbnail("https://i.imgur.com/NOckoNC.png")

    .setTitle(`Voici le lien de la chaine Youtube`)
    .setURL("https://www.youtube.com/channel/UC87oHzvUrxhO_AfbCH5ol7g")
    .setDescription(`:arrow_up:  Clique dessus :arrow_up: `)
    message.channel.sendEmbed(embed);
  }

  if(command === "credits") {
    var embed = new Discord.RichEmbed()
    .setColor('#27ae60')
    .setThumbnail("https://i.imgur.com/JhTjOtl.jpg")

    .setTitle(`Crédits du bot`)
    .setDescription(`Ce bot à été créé par Flav.
    Tout droits réservés.`)
    message.channel.sendEmbed(embed);
  }

  
});

client.on('guildMemberAdd', member => {

  let serverTag = member.guild.name
  const welcomechannel = member.guild.channels.find('id', '531111996213428246')
  const role = member.guild.roles.find("name", "📍 Joueur / Joueuse")    
  member.addRole(role)
  var embed = new Discord.RichEmbed()
  .setColor('#76D880')
  .setDescription(`:white_check_mark: Bienvenue <@${member.user.id}> sur le serveur ${serverTag}.`)
  .setFooter(`Nous sommes ${client.users.size} membres sur le serveur`)
  return welcomechannel.send({embed})
});










client.login(config.token);
