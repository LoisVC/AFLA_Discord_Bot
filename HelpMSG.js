//------------------------------------------------------------------------

//              Description of feature:
//  Sends a text message when someone ask for help in the specific text channel
 
//              How it works:
//  Checks if the text content is help.
//  If it is, display the normal help text. If not, display that it does not match with anything.

//------------------------------------------------------------------------



module.exports = {
    UseHelpMSG: async function(message, client, listeDeServeurs){
        
        //si un message a ete écrit dans le channel commande du serveur principale agit en conséquance de la requete
        switch (message.content.toLocaleLowerCase()) {
            case 'help':
                var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
                await sendto.send("Les commandes présentement programmées sont: \n **-Help** \t (permet d'afficher ce message)");
                
                break;

            default:
                var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[0].channelAdminCommandeId.id);
                await sendto.send("Aucune commande correspondant. \nTapez **help** pour avoir de l'aide");
                    break;
            

        }

    }
}
