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

//setup other file functions
const AutoVC = require('./AutoVC');
const ReactRole = require('./ReactRole');

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

//pour fermer le bot, il faut faire les 2 touche "ctrl" et "c" en mem temps)

//Ferme le bot automatiquement apres 30 sec
//setTimeout(StopBot, 30000)

async function StopBot() {

    var adminannonce = await client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
    await adminannonce.send('closing bot');
    
    console.log("Closing process");
    process.exit();
};