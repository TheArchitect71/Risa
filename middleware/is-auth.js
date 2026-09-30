module.exports=(req,res,next)=>{if(!req.user)return req.isApi?res.status(401).json({error:'Login required'}):res.redirect('/login');next();};
