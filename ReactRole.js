//------------------------------------------------------------------------

//              Description of feature:
//  
//  
 
//              How it works:
//  
//
//

//------------------------------------------------------------------------

//note: listeChannelIdReactionToRole is a hardcoded list of messages that can be reacted to.
module.exports = {
    UseReactRole: async function(packet, BlisteChannelIdReactionToRole, BotId, client){

        switch (packet.t) {
            case 'MESSAGE_REACTION_ADD':
                if (packet.d.user_id == BotId) {return;}
                var AOR = true;
                var messageId = await setRoleViaEmojiInfo(packet, BlisteChannelIdReactionToRole);
                await actRoleViaEmoji(AOR, messageId, packet, BlisteChannelIdReactionToRole, client);
                break;
            case 'MESSAGE_REACTION_REMOVE':
                if (packet.d.user_id == BotId) {return;}
                var AOR = false;
                var messageId = await setRoleViaEmojiInfo(packet, BlisteChannelIdReactionToRole);
                await actRoleViaEmoji(AOR, messageId, packet, BlisteChannelIdReactionToRole, client);
                break;
            default:
                return;
        }
        return;
    }
}

async function ajoutRetirRoleViaEmoji(roleId, userId, serverId, AORRR, client) {
    var guildddd = client.guilds.cache.get(serverId)
    var memb = guildddd.members.cache.get(userId);
    var rolee = guildddd.roles.cache.get(roleId);

    if (AORRR == true)
    {memb.roles.add(rolee);}
    else if (AORRR == false)
    {memb.roles.remove(rolee);}

}
async function setRoleViaEmojiInfo(packettt, listeChannelIdReactionToRole) {
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
async function actRoleViaEmoji(AORR, messageIdd, packett, listeChannelIdReactionToRole, client) {

    switch (packett.d.message_id) {
        case listeChannelIdReactionToRole[0]:
            //un aute switch case pour déterminer quell et l'emoji et role ajouter ou enlever
            switch (packett.d.emoji.name) {
                case '😄':
                    await ajoutRetirRoleViaEmoji('1129981455355883620', packett.d.user_id, packett.d.guild_id, AORR, client);
                    
                    break;
                case '😂':
                    await ajoutRetirRoleViaEmoji('1129981315979153408', packett.d.user_id, packett.d.guild_id, AORR, client);
                    
                    break;
                case '😘':
                    await ajoutRetirRoleViaEmoji('1129981391849926697', packett.d.user_id, packett.d.guild_id, AORR, client);
                    
                    break;
                case 'roue':
                    await ajoutRetirRoleViaEmoji('1130114441875300482', packett.d.user_id, packett.d.guild_id, AORR, client);
                    
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
            console.log("Error: RoleViaEmoji/actRoleViaEmoji -> channelId pas censer arriver ici channelId correspond a aucun channel dans la liste stocker");
            break;
    }
   
}