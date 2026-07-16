// Self-contained QR Code generator (byte mode, ECC L/M, versions 1–10) + <QR> React component.
// No external dependencies — works offline. Produces a real, scannable QR matrix.
(function(){
  // ── GF(256) arithmetic ──
  var EXP = new Array(512), LOG = new Array(256);
  (function(){ var x=1; for(var i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&0x100) x^=0x11d; } for(i=255;i<512;i++) EXP[i]=EXP[i-255]; })();
  function gmul(a,b){ return (a===0||b===0)?0:EXP[LOG[a]+LOG[b]]; }
  function genPoly(n){ var p=[1]; for(var i=0;i<n;i++){ var q=[1,EXP[i]], r=new Array(p.length+1).fill(0);
    for(var a=0;a<p.length;a++) for(var b=0;b<q.length;b++) r[a+b]^=gmul(p[a],q[b]); p=r; } return p; }
  function rsEC(data,n){ var gen=genPoly(n), res=data.concat(new Array(n).fill(0));
    for(var i=0;i<data.length;i++){ var c=res[i]; if(c!==0) for(var j=0;j<gen.length;j++) res[i+j]^=gmul(gen[j],c); }
    return res.slice(data.length); }

  // ── EC tables (L & M, v1–10): [ecPerBlock, [[blocks, dataPerBlock], ...]] ──
  var EC = {
    1:{L:[7,[[1,19]]],   M:[10,[[1,16]]]},
    2:{L:[10,[[1,34]]],  M:[16,[[1,28]]]},
    3:{L:[15,[[1,55]]],  M:[26,[[1,44]]]},
    4:{L:[20,[[1,80]]],  M:[18,[[2,32]]]},
    5:{L:[26,[[1,108]]], M:[24,[[2,43]]]},
    6:{L:[18,[[2,68]]],  M:[16,[[4,27]]]},
    7:{L:[20,[[2,78]]],  M:[18,[[4,31]]]},
    8:{L:[24,[[2,97]]],  M:[22,[[2,38],[2,39]]]},
    9:{L:[30,[[2,116]]], M:[22,[[3,36],[2,37]]]},
    10:{L:[18,[[2,68],[2,69]]], M:[26,[[4,43],[1,44]]]}
  };
  var ALIGN = {1:[],2:[6,18],3:[6,22],4:[6,26],5:[6,30],6:[6,34],7:[6,22,38],8:[6,24,42],9:[6,26,46],10:[6,28,50]};
  function remainderBits(v){ return (v>=2&&v<=6)?7:0; }

  function pushBits(arr,val,len){ for(var i=len-1;i>=0;i--) arr.push((val>>i)&1); }
  function toUtf8(str){ var out=[]; for(var i=0;i<str.length;i++){ var c=str.charCodeAt(i);
    if(c<0x80) out.push(c); else if(c<0x800) out.push(0xc0|(c>>6),0x80|(c&0x3f));
    else out.push(0xe0|(c>>12),0x80|((c>>6)&0x3f),0x80|(c&0x3f)); } return out; }

  // ── encode text → {version, bitstream[]} ──
  function encode(text, level){
    var bytes = toUtf8(text), version=null, info=null, totalData=0;
    for(var v=1; v<=10; v++){ var e=EC[v][level]; var td=e[1].reduce(function(a,g){return a+g[0]*g[1];},0);
      var countBits = v<=9?8:16;
      if(4 + countBits + bytes.length*8 <= td*8){ version=v; info=e; totalData=td; break; } }
    if(!version) throw new Error('payload too long for QR v1–10');
    var countBits = version<=9?8:16, bits=[];
    pushBits(bits, 0x4, 4);                 // byte mode
    pushBits(bits, bytes.length, countBits);
    for(var i=0;i<bytes.length;i++) pushBits(bits, bytes[i], 8);
    var capBits = totalData*8;
    pushBits(bits, 0, Math.min(4, capBits-bits.length));   // terminator
    while(bits.length%8) bits.push(0);                     // pad to byte
    var pad=[0xEC,0x11], pi=0; while(bits.length<capBits){ pushBits(bits, pad[pi++%2], 8); }
    var cw=[]; for(i=0;i<bits.length;i+=8){ var b=0; for(var j=0;j<8;j++) b=(b<<1)|bits[i+j]; cw.push(b); }
    // blocks
    var blocks=[], idx=0;
    info[1].forEach(function(g){ for(var c=0;c<g[0];c++){ var d=cw.slice(idx,idx+g[1]); idx+=g[1]; blocks.push({data:d, ec:rsEC(d, info[0])}); } });
    var maxData=Math.max.apply(null, blocks.map(function(b){return b.data.length;})), out=[];
    for(i=0;i<maxData;i++) blocks.forEach(function(b){ if(i<b.data.length) out.push(b.data[i]); });
    for(i=0;i<info[0];i++) blocks.forEach(function(b){ if(i<b.ec.length) out.push(b.ec[i]); });
    var stream=[]; out.forEach(function(c){ pushBits(stream,c,8); });
    for(i=0;i<remainderBits(version);i++) stream.push(0);
    return {version:version, stream:stream};
  }

  function setFn(m,f,r,c,d){ if(r<0||c<0||r>=m.length||c>=m.length) return; m[r][c]=d; f[r][c]=true; }
  function drawFinder(m,f,r,c){ for(var dy=-4;dy<=4;dy++) for(var dx=-4;dx<=4;dx++){ var d=Math.max(Math.abs(dx),Math.abs(dy)); setFn(m,f,r+dy,c+dx,(d<=1)||(d===3)); } }
  function drawAlign(m,f,r,c){ for(var dy=-2;dy<=2;dy++) for(var dx=-2;dx<=2;dx++){ setFn(m,f,r+dy,c+dx, Math.max(Math.abs(dx),Math.abs(dy))!==1); } }

  function versionInfo(v){ var rem=v; for(var i=0;i<12;i++) rem=(rem<<1)^((rem>>11)*0x1F25); return (v<<12)|rem; }

  function drawFunctions(m,f,version,size){
    drawFinder(m,f,3,3); drawFinder(m,f,3,size-4); drawFinder(m,f,size-4,3);
    for(var i=0;i<size;i++){ if(!f[6][i]) setFn(m,f,6,i,i%2===0); if(!f[i][6]) setFn(m,f,i,6,i%2===0); }
    var pos=ALIGN[version], n=pos.length;
    for(var a=0;a<n;a++) for(var b=0;b<n;b++){ if((a===0&&b===0)||(a===0&&b===n-1)||(a===n-1&&b===0)) continue; drawAlign(m,f,pos[a],pos[b]); }
    setFn(m,f,size-8,8,true);                                   // dark module
    for(i=0;i<9;i++){ if(!f[8][i]){m[8][i]=false;f[8][i]=true;} if(!f[i][8]){m[i][8]=false;f[i][8]=true;} }
    for(i=0;i<8;i++){ m[8][size-1-i]=false; f[8][size-1-i]=true; m[size-1-i][8]=false; f[size-1-i][8]=true; }
    if(version>=7){ var vb=versionInfo(version); for(i=0;i<18;i++){ var bit=((vb>>i)&1)===1, x=size-11+i%3, y=Math.floor(i/3); setFn(m,f,x,y,bit); setFn(m,f,y,x,bit); } }
  }
  function drawData(m,f,stream,size){ var i=0;
    for(var right=size-1; right>=1; right-=2){ if(right===6) right=5;
      for(var vert=0;vert<size;vert++){ for(var j=0;j<2;j++){ var x=right-j, up=((right+1)&2)===0, y=up?size-1-vert:vert;
        if(!f[y][x]){ m[y][x] = i<stream.length ? stream[i]===1 : false; i++; } } } } }
  function applyMask(m,f,mask,size){ for(var y=0;y<size;y++) for(var x=0;x<size;x++){ if(f[y][x]) continue; var inv=false;
    switch(mask){ case 0:inv=(x+y)%2===0;break; case 1:inv=y%2===0;break; case 2:inv=x%3===0;break; case 3:inv=(x+y)%3===0;break;
      case 4:inv=(Math.floor(x/3)+Math.floor(y/2))%2===0;break; case 5:inv=(x*y)%2+(x*y)%3===0;break;
      case 6:inv=((x*y)%2+(x*y)%3)%2===0;break; case 7:inv=((x+y)%2+(x*y)%3)%2===0;break; }
    if(inv) m[y][x]=!m[y][x]; } }
  function drawFormat(m,level,mask,size){
    var ecb={L:1,M:0,Q:3,H:2}[level], data=(ecb<<3)|mask, rem=data;
    for(var i=0;i<10;i++) rem=(rem<<1)^((rem>>9)*0x537);
    var bits=((data<<10)|rem)^0x5412; function gb(i){ return ((bits>>i)&1)===1; }
    for(i=0;i<=5;i++) m[8][i]=gb(i);
    m[8][7]=gb(6); m[8][8]=gb(7); m[7][8]=gb(8);
    for(i=9;i<15;i++) m[14-i][8]=gb(i);
    for(i=0;i<8;i++) m[size-1-i][8]=gb(i);
    for(i=8;i<15;i++) m[8][size-15+i]=gb(i);
    m[size-8][8]=true;
  }
  var PA=[1,0,1,1,1,0,1,0,0,0,0], PB=[0,0,0,0,1,0,1,1,1,0,1];
  function matchAt(arr,i,pat){ for(var k=0;k<11;k++) if((arr[i+k]?1:0)!==pat[k]) return false; return true; }
  function penalty(m,size){ var p=0,x,y,run;
    for(y=0;y<size;y++){ run=1; for(x=1;x<size;x++){ if(m[y][x]===m[y][x-1]) run++; else { if(run>=5)p+=run-2; run=1; } } if(run>=5)p+=run-2; }
    for(x=0;x<size;x++){ run=1; for(y=1;y<size;y++){ if(m[y][x]===m[y-1][x]) run++; else { if(run>=5)p+=run-2; run=1; } } if(run>=5)p+=run-2; }
    for(y=0;y<size-1;y++) for(x=0;x<size-1;x++){ var c=m[y][x]; if(c===m[y][x+1]&&c===m[y+1][x]&&c===m[y+1][x+1]) p+=3; }
    for(y=0;y<size;y++){ for(x=0;x<=size-11;x++){ if(matchAt(m[y],x,PA)||matchAt(m[y],x,PB)) p+=40; } }
    for(x=0;x<size;x++){ var col=[]; for(y=0;y<size;y++) col.push(m[y][x]); for(y=0;y<=size-11;y++){ if(matchAt(col,y,PA)||matchAt(col,y,PB)) p+=40; } }
    var dark=0; for(y=0;y<size;y++) for(x=0;x<size;x++) if(m[y][x]) dark++;
    p += Math.floor(Math.abs(dark/(size*size)*100-50)/5)*10;
    return p;
  }

  function makeQr(text, level){
    level = level||'M';
    var enc = encode(text, level), version=enc.version, size=17+version*4;
    var base=[], fn=[]; for(var r=0;r<size;r++){ base.push(new Array(size).fill(false)); fn.push(new Array(size).fill(false)); }
    drawFunctions(base, fn, version, size);
    drawData(base, fn, enc.stream, size);
    var best=null, bestP=Infinity;
    for(var mask=0;mask<8;mask++){
      var mm=base.map(function(row){return row.slice();});
      applyMask(mm, fn, mask, size);
      drawFormat(mm, level, mask, size);
      var p=penalty(mm,size);
      if(p<bestP){ bestP=p; best=mm; }
    }
    return { size:size, modules:best };
  }

  function QR(props){
    var value=props.value, size=props.size||120, level=props.level||'M', margin=(props.margin==null?4:props.margin),
        fg=props.fg||'#15191D', bg=props.bg||'#ffffff';
    var qr = React.useMemo(function(){ try{ return makeQr(value, level); }catch(e){ return null; } }, [value, level]);
    if(!qr) return null;
    var n=qr.size, total=n+margin*2, cell=size/total, path='';
    for(var y=0;y<n;y++) for(var x=0;x<n;x++){ if(qr.modules[y][x]){ var px=((x+margin)*cell).toFixed(2), py=((y+margin)*cell).toFixed(2), s=cell.toFixed(2);
      path+='M'+px+' '+py+'h'+s+'v'+s+'h-'+s+'z'; } }
    return React.createElement('svg',{width:size,height:size,viewBox:'0 0 '+size+' '+size,shapeRendering:'crispEdges',style:{display:'block',borderRadius:6}},
      React.createElement('rect',{width:size,height:size,fill:bg}),
      React.createElement('path',{d:path,fill:fg}));
  }

  window.makeQr = makeQr;
  window.QR = QR;
})();
