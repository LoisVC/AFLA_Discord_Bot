//------------------------------------------------------------------------

//              Description of feature:
//  When a message is put in a specific channel, it repeats the 
//  message in multiple channel that are linked to it.
 
//              How it works:
//  It looks threw the list of sum discord and sends the 
//  message to each in the set channel for each.
//  It receive the option 1 or 0 to indicate it it is a admin or user message.

//------------------------------------------------------------------------



module.exports = {
    UseMultiServAnnoucement: async function(option, message, client, listeDeServeurs){
        if(option == 1){
            for (let index = 0; index < listeDeServeurs.length; index++) {

                var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[index].channelAdminMessageId.id);
                await sendto.send(message.content);
            }
        }else if(option == 0){
            for (let index = 0; index < listeDeServeurs.length; index++) {

                var sendto = client.channels.cache.find(channel => channel.id === listeDeServeurs[index].channelJoueurMessageId.id);
                await sendto.send(message.content);
            }
        }
        else {
            console.log('Error : MultiServAnnouncement got an unexpected result. The option variable given was not expected')
        }

        
        

    }
}
