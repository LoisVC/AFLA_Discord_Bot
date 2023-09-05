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
var GIT = GatewayIntentBits
const client = new Client({
    intents : [GIT.Guilds, GIT.GuildMembers, GIT.GuildEmojisAndStickers, GIT.GuildVoiceStates, GIT.GuildMessages, GIT.GuildMessageReactions, GIT.GuildMessageReactions, GIT.MessageContent], 
    partials: [Partials.message, Partials.channel, Partials.Reaction] 
})

//setup other file functions
const AutoVC = require('./AutoVC');
const ReactRole = require('./ReactRole');
const HelpMessage = require('./HelpMSG');
const MultiServerAnnoucement = require('./MultiServAnnoucement');

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
//TODO Remove when the app is deployed
    console.log('Bot is Running');
    

    initialiseBotServerList();
    //client.channels.fetch(listeChannelIdReactionToRole[0],{cache: false})
});

//HelpMessage and MultiServerAnnoucement Feature
//Detect messages and decide witch feature to call
client.on('messageCreate', async message => {

    //make sure to not react to the bot's message
    if(message.author.id === BotId)
    { return;}

    //check where the message is comming from and redirect to the correct function
    switch (message.channelId) {
    
        case listeDeServeurs[0].channelAdminMessageId.id:
            //calling to HelpMessage Feature (1 = Admin)
            MultiServerAnnoucement.UseMultiServAnnoucement(1, message, client, listeDeServeurs);
            break;

        case listeDeServeurs[0].channelJoueurMessageId.id:
            //calling to HelpMessage Feature (0 = User)
            MultiServerAnnoucement.UseMultiServAnnoucement(0, message, client, listeDeServeurs);
            break;

        case listeDeServeurs[0].channelAdminCommandeId.id:
            //calling to HelpMessage Feature
            HelpMessage.UseHelpMSG(message, client, listeDeServeurs);
            break;
    }
});

//AutoVC Feature
//Detect when the status of a voice channel is modified
client.on('voiceStateUpdate',  async (oldstate, newstate) =>{
//TODO verify that the function is turned on

    //Goes into the AutoVC folder where the code is.
    AutoVC.UseAutoVC(oldstate, newstate, listeDeServeurs, client, listeSupprimerBlackListe);

});

//ReactRole Feature
//Regarde tout les packets
client.on('raw', async packet => {
//TODO verify that the function is turned on

    ReactRole.UseReactRole(packet, listeChannelIdReactionToRole, BotId, client);

})  


client.login(process.env.DISCORD_TOKEN)

//pour fermer le bot, il faut faire les 2 touche "ctrl" et "c" en meme temps)

//Ferme le bot automatiquement apres 30 sec
//setTimeout(StopBot, 30000)

async function StopBot() {

    var adminannonce = await client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
    await adminannonce.send('closing bot');
    
    console.log("Closing process");
    process.exit();
};