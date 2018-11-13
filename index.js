
const express =require('express');
const app =express();


app.get('/', (req ,res)=>{

    console.log("a")
    console.log("c")

    res.json('練習');   
 });
 
 app.listen(7000);
 