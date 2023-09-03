const { Client, GatewayIntentBits, Message, channelLink, TextChannel, Guild, createChannel, VoiceChannel, Partials, Events } = require('discord.js')
require('dotenv/config')

//pour ajouter un serveur, il faut ajouter son id  comme constant (ligne environ 24) et rajouter cette constante créer a la liste "listeServeurId" (Ligne environ 30)

/*
TODO, choses a améliorer
1) peut ajouter des commandes pour les sous servs, presentement seul serv maire peut faire commandes 
2) faire en sorte que les id peuvent etre lue a partir de fichiers .txt
3) ajouter commande au bot pour mettre a jour les information via commande chat
*/

//les permissions de ce que le bot a les droit de faire.(permissions)
const client = new Client({
    intents : 32767, 
    partials: [Partials.message, Partials.channel, Partials.Reaction] 
})

//variabels qui sont importantes

const BotId = '1051133283280355369';

const serverAB = '291595663115026432';
const serverdeangus = '1122529196523126885';
const serverdeangusaaa = '1122698517345996902';
const chanImp1 = '1124101006062534806';
const chanImp2 = '1124108897951686736';


const nomPardéfaultCommandBot = 'aflabotcommande1432'
const nomPardéfaultAnnonceAdmins = 'annonce-admin'
const nomPardéfaultAnnonceJoueurs = 'annonce-aux-joueur'
const nomPardéfaultSalonVocal = 'Salon Vocal Auto'

var listeDeServeurs = [];

//important, mettre l'id du serveur principale en premier ET sassurer que le discord soint inviter dans le serveur
const listeServeurId = [serverAB,serverdeangus,serverdeangusaaa]
const listeSupprimerBlackListe = [chanImp2,chanImp1]

const listeChannelIdReactionToRole =['1129952726655184897', null, null]
const listeReactionToRole =[]

const listeReactions =["😄","😂","😘"]


//initialisation of the bot list of servers. S'assurer que le bot soit inviter dans le serveu. l'oublie cause de la recherche des channels de crash
async function initialiseBotServerList() {
    for (let index = 0; index < listeServeurId.length; index++) {

        var DisServ = new Object();
        var servcourrant = client.guilds.cache.find(Guild => Guild.id == listeServeurId[index]);

        DisServ.nom = "Discord"+index;
        DisServ.serveurId = listeServeurId[index];
        DisServ.channelAdminCommandeId = await servcourrant.channels.cache.find(channel => channel.name === nomPardéfaultCommandBot );
        DisServ.channelAdminMessageId = await servcourrant.channels.cache.find(channel => channel.name === nomPardéfaultAnnonceAdmins );
        DisServ.channelJoueurMessageId = await servcourrant.channels.cache.find(channel => channel.name === nomPardéfaultAnnonceJoueurs );
        DisServ.channelvocalId = await servcourrant.channels.cache.find(channel => channel.name === nomPardéfaultSalonVocal );

        listeDeServeurs.push(DisServ);
    }

}

async function initialiseReactionListe() {

    var reactionListe = new Object();

    reactionListe.serveurId = null;
    reactionListe.emoji = null;
    reactionListe.role = null;

    listeReactionToRole.push(reactionListe);


}


//Check si bot fontionne en envoyant un log et inisialise le bot
client.on('ready', () => {
    console.log('Bot is Running');
    

    initialiseBotServerList();
    //client.channels.fetch(listeChannelIdReactionToRole[0],{cache: false})
});

//check a chaque message envoyer
client.on('messageCreate', async message => {

    //fait attention de ne pas prendre en compte ces propre messages (message du bot)
    if(message.author.id === BotId)
    { return;}

    //verifie si un message est écrit dans le channel du serveur principale et le renvoit dans le channel correcpondant dans autres serveurs
    switch (message.channelId) {
        //verifie les exportatons des messages venant du serv principale dans les deux premiers case. le troisieme, gere les commande du serv principale
        case listeDeServeurs[0].channelAdminMessageId.id:
            //si un message a ete écrit dans le channel du serveur principale, renvoir le meme message dans les channel correspondant de tout les serveurs
            for (let index = 0; index < listeDeServeurs.length; index++) {

                var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[index].channelAdminMessageId.id);
                await sendto.send(message.content);
            }
            break;
        case listeDeServeurs[0].channelJoueurMessageId.id:
            //si un message a ete écrit dans le channel du serveur principale, renvoir le meme message dans les channel correspondant de tout les serveurs
            for (let index = 0; index < listeDeServeurs.length; index++) {

                var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[index].channelJoueurMessageId.id);
                await sendto.send(message.content);
            }
            break;
        case listeDeServeurs[0].channelAdminCommandeId.id:
            //si un message a ete écrit dans le channel commande du serveur principale agit en conséquance de la requete
            switch (message.content.toLocaleLowerCase()) {
                case 'help':
                    var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
                    await sendto.send("Les commandes présentement programmées sont: \n **-Help** \t (permet d'afficher ce message) \n **-Stop** \t ***BotStop*** et ***StopBot*** fonctionne aussi (arrete le bot, redemarage manuellement du bot necessaire)");
                    
                    break;
                case 'botstop': StopBot();
                    break;
                case 'stop': StopBot();
                    break;
                case 'stopbot': StopBot();
                    break;

                default:
                    var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
                    await sendto.send("Aucune commande correspondant. \nTapez **help** pour avoir de l'aide");
                        break;
            }

            break;
        
    }
});

//detect quand un utilisateur rejoint un sallon vocal
client.on('voiceStateUpdate',  async (oldstate, newstate) =>{

//ces 2 variables tien en memoire l'id du serveur courrant du old et new state pour verification plus tard
var listIdServCourrantOld = await findIdServeurDuVocalCourrant(oldstate);
var listIdServCourrantNew = await findIdServeurDuVocalCourrant(newstate);

    if(newstate.channelId === null){//utilisateur a quitter le channel
        try { 
                await supprimerChannel(oldstate, listIdServCourrantOld,client);

    } catch (error) {console.log("Erreur quand user quite channel"); return;}

    }else if(oldstate.channelId === null){//utilisateur a join le channel
        try { 
                creerChannel(newstate, listIdServCourrantNew);

    } catch (error) {console.log("Erreur quand user join channel"); return;}

    }else{//utilisateur a changer de channel
        try { 

            supprimerChannel(oldstate, listIdServCourrantOld, client);
            creerChannel(newstate, listIdServCourrantNew);
            
        } catch (error) {console.log("Erreur quand usager change de channel"); return;} 
    }
});

async function findIdServeurDuVocalCourrant(chanvoc){
    //serveurCourant = client.guilds.cache.find(Guild => Guild.id === chanvoc.Guild.id)
    resulta = await listeDeServeurs.find(listeDeServeurs => listeDeServeurs.serveurId == chanvoc.guild.id);
    return resulta;
}
async function creer(chanel,categorieid, name){
    //créer un chanel vocal
    if(categorieid == 'rien')
    {
        var chan = await newstate.guild.channels.create({ name: 'Channel Vocal de '+ name })
        .then()
        .catch(console.error);
        return chan
    }
    if(categorieid != 'rien')
    {
        var chan = await chanel.create({ name: 'Channel Vocal de '+ name, parent : categorieid , type: 2})
        .then()
        .catch(console.error);
        return chan
    }
    

}
async function creerChannel(newstate0, listidservcourrant0){

    if(listidservcourrant0.channelvocalId === null || listidservcourrant0.channelvocalId === undefined)
        {console.log("il y a pas de salon vocal nommer correctement dans le serveur") }
    else {
    //check si le channel vocal belle et bien dans le serveur et si oui, créer un nouveau channel et transpher l'utilisteur dedans
        if(newstate0.channelId == listidservcourrant0.channelvocalId.id){
            //si il y a pas de parent (categorie) il change la variable a rien
            try {var categoriechanid = newstate0.channel.parentId;} 
            catch (error) { var categoriechanid = 'rien';}

            //cree le chanel
            var chan = await creer(newstate0.guild.channels, categoriechanid ,newstate0.member.user.username);
                
            //trouver lutilisateur et l'envoie
            const member = newstate0.member;

            //déplacer l'utilisateur dans le channel  
            await member.voice.setChannel(chan.id).catch(e => console.log('utilisateur na pas pu etre bouger'));
        }
    }
}
async function supprimerChannel(oldstate0, listidservcourrant0, client0){

    if(listidservcourrant0.channelvocalId === null || listidservcourrant0.channelvocalId === undefined)
        {console.log("il y a pas de salon vocal nommer correctement dans le serveur") }
    else {

    //Sassure que le channel a deleter ne fait pas partie de la liste listeSupprimerBlackListe a deleter
    var channelBlackListed = false;
    listeSupprimerBlackListe.forEach(element => {
        if(element == oldstate0.channelId)
            {channelBlackListed = true;}
    });
    if(channelBlackListed == true){
        return;
    }

    //sassure que le channel a deleter nest pas le channel de base
        if(oldstate0.channelId != listidservcourrant0.channelvocalId.id){
            //s'assure que le cahannel nest pas vide avent de le delete
            var aaa = client0.channels.cache.find(channel=> channel.id === oldstate0.channelId)
            let count = aaa.members.size;
            if(count === 0){
                try {
                    aaa.delete();
                } catch (error) {console.log(error)}
            }
        }
    }
}

//TODO make sure the bot dosent react to him self

//detect quand un message specifique a une reaction d'ajouter ou retirer
client.on('raw', async packet => {
    switch (packet.t) {
            case 'MESSAGE_REACTION_ADD':
                if (packet.d.user_id == BotId) {return;}
                var AOR = true;
                var messageId = await setRoleViaEmojiInfo(packet);
                await actRoleViaEmoji(AOR,messageId,packet);
                break;
            case 'MESSAGE_REACTION_REMOVE':
                if (packet.d.user_id == BotId) {return;}
                var AOR = false;
                var messageId = await setRoleViaEmojiInfo(packet);
                await actRoleViaEmoji(AOR,messageId,packet);
                break;
            default:
                return;
        }
   //todo enlever le consol log
    console.log(packet.t);
    return;
})  
//TODO l'ajoute dans les 2 fonctions ne fonctionne pas
async function ajoutRetirRoleViaEmoji(roleId, userId, serverId, AORRR) {
    var guildddd = client.guilds.cache.get(serverId)
    var memb = guildddd.members.cache.get(userId);
    var rolee = guildddd.roles.cache.get(roleId);

    if (AORRR == true)
    {memb.roles.add(rolee);}
    else if (AORRR == false)
    {memb.roles.remove(rolee);}

}
async function setRoleViaEmojiInfo(packettt) {
    var temppp;
    listeChannelIdReactionToRole.forEach(e => {
            if (e == packettt.d.message_id) {
                temppp = e;
            }
        });
        return temppp;
}
//todo presentement hardcoder le check du quel channel la requete provien. il faut le mettre modulaire.
//TODO fair une liste de model ayant serveur id, role id et nom du emoji et guild id pour faire seuleument un appelk et rendre lajout automatique modulaire
async function actRoleViaEmoji(AORR, messageIdd, packett) {

    switch (packett.d.message_id) {
        case listeChannelIdReactionToRole[0]:
            //un aute switch case pour déterminer quell et l'emoji et role ajouter ou enlever
            switch (packett.d.emoji.name) {
                case '😄':
                    await ajoutRetirRoleViaEmoji('1129981455355883620', packett.d.user_id, packett.d.guild_id, AORR);
                    
                    break;
                case '😂':
                    await ajoutRetirRoleViaEmoji('1129981315979153408', packett.d.user_id, packett.d.guild_id, AORR);
                    
                    break;
                case '😘':
                    await ajoutRetirRoleViaEmoji('1129981391849926697', packett.d.user_id, packett.d.guild_id, AORR);
                    
                    break;
                case 'roue':
                    await ajoutRetirRoleViaEmoji('1130114441875300482', packett.d.user_id, packett.d.guild_id, AORR);
                    
                    break;
            
                default:
                    console.log("Error: RoleViaEmoji/actRoleViaEmoji -> Emoji non reconnue");
                    break;
            }
            
            break;
        case listeChannelIdReactionToRole[1]:
            console.log("Error: RoleViaEmoji/actRoleViaEmoji -> channelId pas censer arriver ici (1)");
            break;
        case listeChannelIdReactionToRole[2]:
            console.log("Error: RoleViaEmoji/actRoleViaEmoji -> channelId pas censer arriver ici (2)");
            break;
    
        default:
            console.log("Error: RoleViaEmoji/actRoleViaEmoji -> channelId pas censer arriver ici (1) channelId correspond a aucun channel dans la liste stocker");
            break;
    }
   
}

client.login(process.env.DISCORD_TOKEN)

//pour fermer le bot, il faut faire les 2 touche "ctrl" et "c" en mem temps)

//Ferme le bot automatiquement apres 30 sec
//setTimeout(StopBot, 30000)

async function StopBot() {

    var adminannonce = await client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
    await adminannonce.send('closing bot');
    
    console.log("Closing process");
    process.exit();
};