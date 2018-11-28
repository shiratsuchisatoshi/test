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

// constでも書ける。letだとリセットしたときにボムカウントが0になってしまう。
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
// console.log(BomPosition);


app.get('/board', (req ,res)=>{
if (req.query.x){
    
    // urlのパラメーターを取得
    // queryは文字列で飛んでくる
    let x= Number(req.query.x);
    let y= Number(req.query.y);
    let user = req.query.user;
    let safeflag = req.query.safeflag;

        if(safeflag=='true'){
            board[y][x].safeflag = safeflag
            board[y][x].user = user
        }else{
            board[y][x].safeflag = safeflag
            board[y][x].user = user
            board[y][x].opened = true 
        }
        
   

    //周辺の爆弾捜査
    bomsearch(x,y);

  

    if(board[y][x].number == 0 ){
        let n=0;
        let n2=0;
        let n3=0;
        let n4=0;
        
        while(n <=9-x) {
            console.log("x",x)
            board[y][x+n].opened = true;
             bomsearch(x+n,y);
             
             if(board[y][x+n].number == 0 ){
                while(n2 <=9-y) {
                    console.log("y",y+n2)
                    board[y+n2][x+n].opened = true;
                     bomsearch(x+n,y+n2);
                    if(board[y+n2][x+n].number==true){
                        n2=0;
                        break;
                    }
                    n2++;
                }
                n2=0;
             }
        if(board[y][x+n].number==true){
            break;
        }
    n++;
}


    

    while(0 <= x-n3) {
        board[y][x-n3].opened = true;
        bomsearch(x-n3,y);
       
            if(board[y][x-n3].number == 0 ){
                while(n4 <=9-y) {
                    console.log("y",y+n2)
                    board[y+n4][x-n3].opened = true;
                    bomsearch(x-n3,y+n4);
                        if(board[y+n4][x-n3].number==true){
                            n4=0;
                            break;
                        }
                    n4++;
                }
                n4=0;
            }
        
        // console.log(n3);
        if(board[y][x-n3].number==true){
            break;
        }
        n3++;
    }



        
    }  

   




//   function chain(x,y){

//     for ( let i=-1; i<=1; i++){ 
//         for ( let j=-1; j<=1; j++){ 
//             chain2(x,y,i,j)   
//         }
//     }
//   }

  
//   function chain2(x,y,i,j){
//       x=x+i
//       y=y+j
//     //   console.log(x,y)
//       if(x>=0 && x<=9 && y>=0 && y<=9){
//         board[y][x].opened=true;

//         bomsearch(x,y);
//         console.log(y,x);
//                 // if(board[y][x].number==0){
//                 //     chain(x,y);
//                 // }
//         }
//   }




    function bomsearch(x,y){
             let bomnum = 0;

                around.map(( value, index, array )=>{
            
                    let a = array[index][0];
                    let b = array[index][1];
                    let c = y+a;
                    let d = x+b;
            
                        if(c>=0 && c<=9 && d>=0 && d<=9){
                            if(board[c][d].hasBom===true){ 
                                bomnum++;
                            }
                            board[y][x].number = bomnum;
            }     
    });

}



        // ★爆発判定処理★
        let count = 0; // もしどこかでexploded: trueになったときにカウントされる

        // 開いた座標に爆弾があるか確認
        BomPosition.map(( value, index, arr )=>{
            // 旗が設置してあったときの処理
            if(board[y][x] == board[arr[index][0]][arr[index][1]] && board[y][x].safeflag==='true'){
                board[y][x].safeflag = true;  
            }
            // 開いた箇所に爆弾があったときの処理
            if(board[y][x] == board[arr[index][0]][arr[index][1]] && board[y][x].safeflag==='false'){
                board[y][x].exploded = true;
                board[y][x].opened = true;
                count++;
                delete arr[index];// 開いた座標を配列から削除（その他の誘爆に巻き込まれないため）
            }
            //もしどこかでexploded: trueになった場合（カウントが1になった場合）、ほかの爆弾も爆発
            if(count==1){
                BomPosition.map(( value, index, arr )=>{
                    board[arr[index][0]][arr[index][1]].exploded = true;
                    board[arr[index][0]][arr[index][1]].opened = false;
                    board[arr[index][0]][arr[index][1]].safeflag = false;
                })
                count=0; // カウントを0に戻す
            }
        });


    }

        

    //    }
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
    // console.log(board2);
   
    
});


app.listen(8000);
