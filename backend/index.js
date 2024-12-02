const express = require('express');
const cors = require("cors"); //backend api Is not call then try this
require('./db/config');
const User = require("./db/User");
const Product = require("./db/Product");
const app = express();
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm"


app.use(express.json());
app.use(cors());//backend api Is not call then try this

app.post("/register", async (req, resp)=>{
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password; //dont show password in api
    Jwt.sign({result},jwtKey,{expiresIn: "2h"}, (err, token)=>{
        if(err){
            resp.send({result: "something went wrong"})
        }
        resp.send({result, auth: token})
    })
});

app.post("/login", async(req, resp)=>{
    if(req.body.password && req.body.email){
        let user = await User.findOne(req.body).select("-password");
        if(user){
            Jwt.sign({user}, jwtKey, { expiresIn: "2h" }, (err, token)=>{
                if(err){
                    resp.send({result: "something went wrong"})
                }
                resp.send({user, auth: token})
            })
            
        }else{
            resp.send({result: "No user found"});
        }
    }else{
        resp.send({result: "No user found"})
    }
})

app.post("/add-product", async (req,resp)=>{
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result)
})


app.get("/products", async(req, resp)=>{
    let products = await Product.find();
    if(products.length > 0){
        resp.send(products)
    }else{
        resp.send({result: "No Products found"})
    }
})


app.delete("/product/:id", async (req,resp)=>{
    // resp.send(req.params.id);
    const  result = await Product.deleteOne({_id:req.params.id});
    resp.send(result);
})

app.get("/product/:id", async (req, resp)=>{
    let result = await Product.findOne({_id:req.params.id});
    if(result){
        resp.send(result)
    }else{
        resp.send({result: "No Result found"})
    }
})

app.put("/product/:id", async(req, resp)=>{
    let result = await Product.updateOne(
        {_id:req.params.id},{
            $set: req.body
        }
    )
    resp.send(result);
})

app.get("/search/:key", async (req, resp)=>{
    let result = await Product.find(
        {
            "$or": [
                {name: {$regex: req.params.key}},
                {company: {$regex: req.params.key}},
                {category: {$regex: req.params.key}}
            ]
        }
    );
    resp.send(result)
})

function verifyToken(req, resp, next){
    const token = req.headers['authorization'];
    console.warn("middleware called", token);
    next();
}


app.listen(5000)