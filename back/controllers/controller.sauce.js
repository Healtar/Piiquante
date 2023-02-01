const fs = require('fs');

const Sauce = require('../models/Sauce');

// CREATE
exports.createSauce = async (req, res) => {

  const sauceObject = JSON.parse(req.body.sauce); 
  const userId = req.auth.userId
  const {name, manufacturer, description, mainPepper, heat} = sauceObject;

  const sauce = new Sauce({
    userId: userId,
    name: name,
    manufacturer: manufacturer,
    description: description,
    mainPepper: mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    heat: heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
    })

    sauce.save()
         .then((message) => res.status(201).json({message}))
         .catch((error) => res.status(400).json({error}))
};

// READ
exports.getAllSauce = async (req, res, next) => {

  Sauce.find()
       .then((sauces) => res.status(200).json(sauces))
       .catch((error) => res.status.json(error))
};

// READ
exports.getOneSauce = (req, res) => {

  Sauce.findById(req.params.id)
       .then((sauce) => res.status(200).json(sauce))
       .catch((error) => res.status(400).json(error))
    
};

// UPDATE
exports.updateSauce = (req, res) => {

  const sauceId = req.params.id;
  const userId = req.auth.userId; 

  // Si un fichier existe, alors créé l'url, sinon, garder l'url de l'image
  const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}` : req.body.imageUrl;

  // récupère les infos de la sauce
  const {name, manufacturer, description, mainPepper, heat} = req.body;

  // récupère la sauce et la met à jour, 
  // SI l'id de la sauce et de l'utilisateurs match avec ceux présent en bd
  Sauce.findById(sauceId)
       .then((sauce) => {
          if (sauce.userId !== userId) 
          {
            res.status(401).json({message: 'Non autorisé !'})
          }
          else
          {
            Sauce.updateOne({_id: req.params.id, userId: req.auth.userId}, 
            {
              name: name,
              manufacturer: manufacturer, 
              description: description, 
              mainPepper: mainPepper, 
              imageUrl: imageUrl, 
              heat: heat
            })
                 .then(() => res.status(200).json({message : 'Objet modifié!'}))
                 .catch((error) => res.status(401).json(error))
          }
        
       })
       .catch((error) => res.status(400).json(error))
};

exports.likeSauce = (req, res) => {

  const sauceId = req.params.id;
  const userId = req.auth.userId;
  const like = req.body.like

  /**
   * appel une fonction par rapport à la valeur du like
   */
  const userState = {
    '-1': ()  => userDislike(sauceId, userId, res),
    '0':  ()  => cancelLikeDislike(sauceId, userId, res),
    '1':  ()  => userLike(sauceId, userId, res),
    'default': () => {console.log('valeur inconnue'); res.status(400).json({message: 'valeur inconnue'})}
  };

  (userState[like] || userState['default'])();

};

// DELETE
exports.deleteSauce = (req, res) => {

  const sauceId = req.params.id;
  const userId = req.auth.userId; 

  Sauce.findById(sauceId)
       .then((sauce) => {

        if (sauce.userId !== userId) 
        {
          res.status(401).json({message: 'Non autorisé'});
        }
        else
        {
          const filename = sauce.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({_id: sauceId})
               .then(() => res.status(200).json({message: 'Sauce supprimée !'}))
               .catch((error) => res.status(400).json(error))
        });
        }
        
        
       })
       .catch((error) => res.status(400).json(error))
};


// fonctions 

/**
 * 
 * Incrémente un like pour une sauce en fonction de son id
 * Ajoute l'id de l'utilisateur au tableau userLiked
 * 
 * @param {int} sauceId 
 * @param {int} userId 
 * @param {*} res 
 */
function userLike (sauceId, userId, res)
{
  Sauce.findById(sauceId)
       .then((sauce) => {
          sauce.usersLiked.push(userId);
          sauce.likes++;
          Sauce.updateOne({_id: sauceId}, {likes: sauce.likes, usersLiked: sauce.usersLiked})
               .then(() => res.status(200).json({message: 'like ajouté'}))
               .catch((error) => res.status(400).json(error))

       })
       .catch(() => res.status(400).json())
}

/**
 * 
 * Incrémente un dislike pour une sauce en fonction de son id
 * Ajoute l'id de l'utilisateur au tableau userDisliked
 * 
 * @param {int} sauceId 
 * @param {int} userId 
 * @param {*} res 
 */
function userDislike (sauceId, userId, res)
{
  Sauce.findById(sauceId)
       .then((sauce) => {
          sauce.usersDisliked.push(userId);
          sauce.dislikes++;
          Sauce.updateOne({_id: sauceId}, {dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked})
               .then(() => res.status(200).json({message: 'dislike ajouté'}))
               .catch((error) => res.status(400).json(error))

       })
       .catch(() => res.status(400).json())
}

/**
 * 
 * Retire 1 à like ou dislike d'une sauce par rapport à l'id user présent dans userLiked ou userDisliked
 * 
 * @param {int} sauceId 
 * @param {int} userId 
 * @param {*} res 
 */
function cancelLikeDislike (sauceId, userId, res)
{
  Sauce.findById(sauceId)
       .then((sauce) => {
          if (sauce.usersLiked.indexOf(userId) !== -1) 
          {
            sauce.usersLiked = sauce.usersLiked.filter((user) => user !== userId);
            sauce.likes--;
            Sauce.updateOne({_id: sauceId}, {likes: sauce.likes, usersLiked: sauce.usersLiked})
                 .then(() => res.status(200).json({message: 'Like annulé !'}))
                 .catch((error) => res.staus(400).json(error))
          } 
          else if (sauce.usersDisliked.indexOf(userId) !== -1) 
          {
            sauce.usersDisliked = sauce.usersDisliked.filter((user) => user !== userId);
            sauce.dislikes--;
            Sauce.updateOne({_id: sauceId}, {dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked})
                 .then(() => res.status(200).json({message: 'Dislike annulé !'}))
                 .catch((error) => res.staus(400).json(error))
          }

       })
       .catch(() => res.status(400).json())
}


