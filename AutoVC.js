//------------------------------------------------------------------------

//              Description of feature:
//  This Feature is trying to automaticly create and delete a voice channel according to the user.
//  The gole of the feature is to reduce empty voice channels.
 
//              How it works:
//  When joining the specific voice channel (in this case any channel names "Salon Vocal Auto") it will create a new voice channel with the name of the user and move him to into it.
//  The channel act as a normal voice chat until it last user leaves it.
//  It checks every time someone leaves and check if it was the last user.
//  If so, it will deleate the voice channel.

//------------------------------------------------------------------------

//variables used later in the code


module.exports = {
    UseAutoVC: async function(oldstate,newstate, BlisteDeServeurs, Bclient, BlisteSupprimerBlackListe){
        
            
        //ces 2 variables tien en memoire l'id du serveur courrant du old et new state pour verification plus tard
        var listIdServCourrantOld = await findIdServeurDuVocalCourrant(oldstate, BlisteDeServeurs);
        var listIdServCourrantNew = await findIdServeurDuVocalCourrant(newstate, BlisteDeServeurs);

        if(newstate.channelId === null){//utilisateur a quitter le channel
            try { 
                    await supprimerChannel(oldstate, listIdServCourrantOld, Bclient, BlisteSupprimerBlackListe);

        } catch (error) {console.log("Erreur quand user quite channel"); return;}

        }else if(oldstate.channelId === null){//utilisateur a join le channel
            try { 
                    creerChannel(newstate, listIdServCourrantNew);

        } catch (error) {console.log("Erreur quand user join channel"); return;}

        }else{//utilisateur a changer de channel
            try { 

                supprimerChannel(oldstate, listIdServCourrantOld, Bclient, BlisteSupprimerBlackListe);
                creerChannel(newstate, listIdServCourrantNew);
                
            } catch (error) {console.log("Erreur quand usager change de channel"); return;} 
        }



    }
}


async function findIdServeurDuVocalCourrant(chanvoc, listeDeServeurs){
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
async function supprimerChannel(oldstate0, listidservcourrant0, client0, listeSupprimerBlackListe){

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