const fs = require('fs');

const Sauce = require('../models/Sauce');

exports.createSauce = async (req, res, next) => {
  
  const sauceObject = JSON.parse(req.body.sauce); 
  

   const sauce = await new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
   })

   try 
   {
    sauce.save(); 
    res.status(201).json({message: 'Post saved successfully!'});
   } 
   catch (error) 
   {
    res.status(400).json({error})
   }
  };

  exports.getOneSauce = async (req, res, next) => {
    
    try 
    {
      const sauce = await Sauce.findOne({_id: req.params.id});
      res.status(200).json(sauce)
      // const sauce = await res.status(200).json(res);
    } catch (error) 
    {
      res.status(400).json({ error });  
    }
  };

  exports.updateSauce = async (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    try
    {
      const sauce = await Sauce.findOne({_id: req.params.id})
      if (sauce.userId != req.auth.userId) 
      {
          res.status(401).json({ message : 'Not authorized'});
      }
      else
      {
        try 
        {
          await Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
          res.status(200).json({message : 'Objet modifié!'});
        } catch (error) {
          res.status(401).json({ error });
        }

      }
    } catch (error) 
    {
      res.status(400).json({ error });
    }
  };

  exports.likeSauce = async (req, res, next) => {

    try 
    {
      const sauce = await Sauce.findOne({
        _id: req.params.id,
      });
      

    switch (req.body.like) {

      //Si l'utilisateur met un dislike
      case -1:
        if (sauce.usersDisliked.indexOf(req.auth.userId) == -1) {
          sauce.usersDisliked.push(req.auth.userId);
          sauce.likes--;
          try {
            await Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes, usersDisliked: sauce.usersDisliked})
            res.status(200).json({message: 'youpiiii'})
          } catch (error) {
            res.status(400).json({usersDisliked: usersDisliked})
          }
          
        }
        break;

      //Si l'utilisateur annule son like ou dislike
      case 0:
        

           if (sauce.usersLiked.indexOf(req.auth.userId) !== -1) 
           {
    
            sauce.usersLiked = sauce.usersLiked.filter((user) => user !== req.auth.userId);
            sauce.likes--;
            try 
            {
              await Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes, usersLiked: sauce.usersLiked})
              res.status(200).json({message: sauce.usersLiked})
            } catch (error) 
            {
              res.status(400).json({userliked: usersLiked})
            }
            
          }
          else if (sauce.usersDisliked.indexOf(req.auth.userId) !== -1) 
          {
            sauce.usersDisliked = sauce.usersDisliked.filter((user) => user !== req.auth.userId);
            sauce.likes++;
            try 
            {
              await Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes, usersDisliked: sauce.usersDisliked})
              res.status(200).json({message: 'youpiiii'})
            } catch (error) 
            {
              res.status(400).json({usersDisliked: usersDisliked})
            }
            
          }

        break;

      //Si l'utilisateur met un like
      case 1: 
 
            if (sauce.usersLiked.indexOf(req.auth.userId) == -1) 
            {
            sauce.usersLiked.push(req.auth.userId);
            sauce.likes++;
            try 
            {
              await Sauce.updateOne({_id: req.params.id}, {likes: sauce.likes, usersLiked: sauce.usersLiked})
              res.status(200).json({message: 'youpiiii'})
            } catch (error) 
            {
              res.status(400).json({userliked: usersLiked})
            }
          }

        break;
    
      default:
        res.status(400).json({error: "valeur inconnue"});
        break;
    }
  } catch (error) 
  {
      res.status(400).json({error: error})
  }

  };

  exports.getAllSauce = async (req, res, next) => {

    try 
    {
      const sauces = await Sauce.find();
      res.status(200).json(sauces);
    } catch (error) 
    {
      res.status(400).json({  error: error});
    }
  };

  exports.deleteSauce = async (req, res, next) => {

    try 
    {
      const sauce = await Sauce.findOne({_id: req.params.id}); 
      if (sauce.userId != req.auth.userId)
      {
        res.status(401).json({message: 'Not authorized'});

      }
      else
      {
        const filename = sauce.imageUrl.split('/images/')[1];
        
          fs.unlink(`images/${filename}`, async () => {
            try 
            {
              await Sauce.deleteOne({_id: req.params.id});
              res.status(200).json({message: 'Sauce supprimé !'});
            } 
            catch (error) 
            {
              res.status(401).json({ error });
            }
           
          })
      }
    } 
    catch (error) 
    {
      res.status(500).json({ error });
    }
 };
 