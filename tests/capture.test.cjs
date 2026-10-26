const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function fixture(overrides={},options={backdrop:'#fff',confirmUnobscured:true},ancestorRect=null,ancestorDisabled=false){
  const css={color:'rgb(0, 0, 0)',backgroundColor:'rgba(255, 255, 255, 0.8)',backgroundImage:'none',opacity:'1',filter:'none',backdropFilter:'none',mixBlendMode:'normal',backgroundBlendMode:'normal',boxShadow:'none',maskImage:'none',textShadow:'none',visibility:'visible',fontSize:'16px',fontWeight:'400',getPropertyValue:()=>'',...overrides};
  const doc={};doc.defaultView={getComputedStyle:(el,pseudo)=>pseudo?{content:'none'}:css};
  const el={nodeType:1,ownerDocument:doc,isConnected:true,children:[],tagName:'BUTTON',parentElement:null,getBoundingClientRect:()=>({width:100,height:30,left:0,top:0,right:100,bottom:30}),getRootNode:()=>doc,getAttribute:()=>null,matches:s=>s===':focus-visible',get innerText(){throw new Error('Must never read text')},get href(){throw new Error('Must never read href')}};
  if(ancestorRect)el.parentElement={nodeType:1,parentElement:null,getBoundingClientRect:()=>ancestorRect,matches:s=>ancestorDisabled&&s===':disabled',getAttribute:()=>null};
  const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/capture.js','utf8'),context);
  return JSON.parse(JSON.stringify(context.StateLensCapture(el,options)));
}
test('collector reads styles only and preserves observed focus',()=>{const s=fixture();assert.equal(s.pairs[0].state,'active+focus-visible');assert.equal(s.pairs[0].foreground,'rgb(0, 0, 0)');assert.equal(s.pairs[0].unsupported.length,0);assert.equal('url' in s.source,false);assert.equal('text' in s.pairs[0],false)});
test('collector defaults to unknown overlay/canvas and catches unsupported painting',()=>{assert.ok(fixture({},{}).pairs[0].unsupported.length>=2);for(const css of [{backgroundImage:'linear-gradient(red,blue)'},{opacity:'.4'},{filter:'blur(1px)'},{boxShadow:'0px 1px 2px #000'},{textShadow:'1px 1px #000'},{mixBlendMode:'multiply'},{maskImage:'url(mask.svg)'}])assert.ok(fixture(css).pairs[0].unsupported.length>0)});

test('collector rejects geometry and clipping it cannot model',()=>{
  assert.ok(fixture({},undefined,{left:20,top:0,right:120,bottom:30,width:100,height:30}).pairs[0].unsupported.includes('Target extends outside an ancestor painting box'));
  for(const css of [{backgroundClip:'padding-box'},{clipPath:'circle(40%)'},{borderTopLeftRadius:'8px'},{transform:'matrix(1, 0, 0, 1, 0, 0)'},{clip:'rect(0px, 5px, 5px, 0px)'}])assert.ok(fixture(css).pairs[0].unsupported.length>0);
});

test('disabled fieldset ancestors never confer a false text exemption',()=>{
 const r=fixture({},undefined,{left:0,top:0,right:100,bottom:30},true).pairs[0];
 assert.equal(r.disabled,false);assert.ok(r.unsupported.some(x=>x.includes('Disabled ancestor semantics')));
});
