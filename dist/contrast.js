(function(root){
function normalize(hex){if(typeof hex!=='string'||!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex))return null;return (hex.length===4?'#'+hex.slice(1).split('').map(c=>c+c).join(''):hex).toUpperCase()}
function luminance(hex){hex=normalize(hex);if(!hex)throw new Error('Invalid HEX');const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function ratio(a,b){let x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function passes(value,minimum){return value>=minimum}
const api={normalize,luminance,ratio,passes};root.Contrast=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
