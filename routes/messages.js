const express = require("express");
const router = new express.Router();
const Message = require("../models/message");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");
const { json } = require("express/lib/response");
const { user } = require("pg/lib/defaults");
const ExpressError = require("../expressError");


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function(req,res,next){
    try{
        let message = Message.get(req.params.id);
        return res.json({message});
    }catch(err){
        return next(err)
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function(req,res,next){
    try{
        let newMsg = Message.create({
            from_username: req.user.username,
            to_username: req.body.to_username,
            body: req.body.body
        })
        return res.json({message: newMsg});
    }catch(err){
        return next(err)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", ensureLoggedIn, async function(req,res,next){
    try{
        let msgRead = Message.get(req.params.id);

        if(msgRead.to_user.username === req.user.username){
            let newMsgRead = Message.markRead(req.params.id);
            return res.json({message: newMsgRead})
        } else{
            throw new ExpressError("Not correct User", 404)
        }
    } catch(err){
        return next(err)
    }
} )

module.exports = router;
