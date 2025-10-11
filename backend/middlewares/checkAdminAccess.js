const checkAdminRole = async(req, res, next) =>{
    try{
        if(req.role !== "admin"){
            return res.status(401).json({ message : "access denied" });
        }
        next();
    }
    catch(error){
        res.status(500).json({ message : "something went wrong!" });
    }
}

module.exports = {checkAdminRole};