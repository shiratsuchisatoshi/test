
const express =require('express');
const app =express();


app.get('/', (req ,res)=>{

    console.log("a")

    res.json('練習');   
 });
 
 app.listen(7000);
 