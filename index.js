const express =require('express');
const app =express();
const width = 10;
const height = 10;
app.use(express.static('static'));


// 下記の記載はapp.use(express.static('static'));の一行で代用できる
// 組み込みモジュール→跡で調べる
// const fs = require('fs');
// const path =require('path');
// const htmlPath =path.join(__dirname,'./static/index.html');

// const html =fs.readFileSync(htmlPath,'utf8');
// app.get('/',(req,res)=>{
//     res.send(html);
// });


//周辺情報
const around =[
    [-1,-1],
    [0,-1],
    [1,-1],
    [1,0],
    [1,1],
    [0,1],
    [-1,1],
    [-1,0],
  ];

const board =[];

for ( let i=0; i<width; i++){ 
    board[i]=[]
    for ( let j=0; j<height; j++){ 
        board[i][j]={ hasBom:false,opened:false }    
    }
}


let BomCount = 10;   //★爆弾の数
const BomPosition=[];//★爆弾の場所を格納用の配列
 
while(BomCount > 0) {
     
    BomCount--;

    let i = Math.floor(Math.random() *9);
    let j = Math.floor(Math.random() *9);

    // let i = BomCount
    // let j = BomCount
    board[i][j] = { hasBom: true, opened: false};
    BomPosition.push([i,j]);//★爆弾の場所を配列に格納★ 
}

//爆弾の座標確認用 
console.log(BomPosition);


app.get('/board', (req ,res)=>{
       
    //urlのパラメーターを取得
    let x= Number(req.query.x);
    let y= Number(req.query.y);
    let user = req.query.user;
        board[y][x]= { user:user ,opened: true }

    //周辺の爆弾捜査
    let bomnum = 0;

    around.map(( value, index, array )=>{

        let a = array[index][0];
        let b = array[index][1];
        let c = y+a;
        let d = x+b;

            if(c>=0 && c<=9 && d>=0 && d<=9){
                if(board[c][d].hasBom === true){ 
                    bomnum++;
                }
                board[y][x].number = bomnum;
            }   
    });
   

    let count = 0; // もしどこかでexploded: trueになったときにカウントされる

    // 開いた座標に爆弾があるか確認
    BomPosition.map(( value, index, arr )=>{
        if(board[y][x]==board[arr[index][0]][arr[index][1]]){
            board[arr[index][0]][arr[index][1]]= { exploded: true,opened: true };
                count++;
                    delete arr[index];// 開いた座標を配列から削除（その他の誘爆に巻き込まれないため）
        }

         //もしどこかでexploded: trueになった場合（カウントが1になった場合）、ほかの爆弾も爆発
        if(count==1){
            BomPosition.map(( value, index, arr )=>{
                board[arr[index][0]][arr[index][1]]= { exploded: true,opened: false };
            })
            count=0; // カウントを0に戻す
        }

    });

    //   配列をコピー
    let str = JSON.stringify(board);
    let board2 = JSON.parse(str);

   //   hasBomを隠す
    for ( let i=0; i<width; i++){ 
        for ( let j=0; j<height; j++){ 
            delete board2[i][j].hasBom;
        }
    }

    res.json(board2);   
    console.log(board2);
  
});


app.listen(8000);
