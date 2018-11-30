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

    // let i = Math.floor(Math.random() *9);
    // let j = Math.floor(Math.random() *9);

    let i = BomCount
    let j = BomCount
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
        
   //クリックした箇所にsafeflagがなかった場合は座標周辺の爆弾捜査
    if(safeflag=='false'){
        bomnum = bomsearch(y,x);
        board[y][x].number = bomnum;  
        }


    //フィールド全体をsetIntervalで確認。0が開かれている箇所があれば周囲捜索を行う
    // setIntervalでなければ非同期処理のためか途中で０連鎖が止まってしまう。
    setInterval(() => {
        for ( let i=0; i<width; i++){ 
            for ( let j=0; j<height; j++){ 
                if(board[i][j].number == 0 && board[i][j].hasBom == false){ 
                    zerochain(i,j)
                }   
            }
        }
        }, 0);


        // for ( let i=0; i<width; i++){ 
        //     for ( let j=0; j<height; j++){ 
        //         if(board[i][j].number == 0 && board[i][j].hasBom == false){ 
        //             zerochain(i,j)
        //         }   
        //     }
        // }


    // if(board[y][x].number == 0 ){
    //     chain(y,x)
    // }


    // 開いた座標が0であったときの0連鎖の関数処理
    function zerochain(y,x){

        for ( let i=-1; i<=1; i++){ 
            for ( let j=-1; j<=1; j++){ 
                x2=x+j
                y2=y+i

                if(x2>=0 && x2<=9 && y2>=0 && y2<=9){
                    board[y2][x2].opened = true;
                    bomnum = bomsearch(y2,x2);
                    board[y2][x2].number = bomnum;
                    // console.log(bomnum);
                    }   
            }   
        }
    }  

    function bomsearch(y,x){
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
                        }          
              });
              return bomnum;
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

// クリアー判定
    // setInterval(() => {
    let clearjugde = width*height - 10;
    let openbox = 0;

    for ( let i=0; i<width; i++){ 
        for ( let j=0; j<height; j++){ 
            if(board[i][j].opened == true){
                openbox++
                // console.log(openbox,clearjugde);
                if (openbox == clearjugde){
                    board[i][j].clear = true
                }
            }
        }
    }
    // },0)

    //   配列をコピー
    let string = JSON.stringify(board);
    let board2 = JSON.parse(string);

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
