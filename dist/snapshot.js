(function(root){
  'use strict';
  const C=typeof module!=='undefined'?require('./contrast.js'):root.Contrast;
  const MAX_BYTES=256000, MAX_PAIRS=100;
  const byteLength=s=>typeof TextEncoder!=='undefined'?new TextEncoder().encode(s).length:Buffer.byteLength(s,'utf8');
  function string(v,max=128){return typeof v==='string' && v.length<=max;}
  function audit(input){
    if(typeof input==='string'){if(byteLength(input)>MAX_BYTES)throw new Error('Snapshot exceeds 256 KB');try{input=JSON.parse(input)}catch{throw new Error('Invalid JSON')}}
    if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a snapshot object');
    if(byteLength(JSON.stringify(input))>MAX_BYTES)throw new Error('Snapshot exceeds 256 KB');
    if(input.schemaVersion!==1||!Array.isArray(input.pairs)||!input.pairs.length||input.pairs.length>MAX_PAIRS)throw new Error('Expected schemaVersion 1 and 1–100 pairs');
    // Whitelist provenance; never copy arbitrary page metadata, URLs or text.
    const kinds=new Set(['computed-style','manual','manual-example','design-matrix']);
    const scopes={
      'computed-style':'One user-selected observed text element; user-declared canvas and overlay assumptions.',
      manual:'User-declared color pairs.',
      'manual-example':'Synthetic example; not a real-page capture.',
      'design-matrix':'Simulated design-state color pairs.'
    };
    const kind=kinds.has(input.source?.kind)?input.source.kind:'manual';
    const captured=input.source?.capturedAt;
    const capturedAt=typeof captured==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(captured)&&Number.isFinite(Date.parse(captured))?new Date(captured).toISOString():null;
    const source={kind,capturedAt,scope:scopes[kind],trust:'User-supplied metadata; not independently verified.'};
    const results=input.pairs.map((p,i)=>{
      if(!p||typeof p!=='object'||!string(p.id)||!p.id.trim()||!string(p.state)||typeof p.disabled!=='boolean'||!Array.isArray(p.backgrounds)||p.backgrounds.length>50||!p.backgrounds.every(x=>string(x))||!string(p.foreground)||!string(p.backdrop)||!Array.isArray(p.unsupported)||p.unsupported.length>50||!p.unsupported.every(x=>string(x,240)))throw new Error(`Invalid pair at index ${i}`);
      if(!Number.isFinite(p.fontSize)||p.fontSize<=0||p.fontSize>1000||!Number.isFinite(p.fontWeight)||p.fontWeight<1||p.fontWeight>1000)throw new Error(`Invalid typography at index ${i}`);
      const issues=p.unsupported.slice();
      const fontLarge=p.fontSize>=24||(p.fontSize>=18.666666666666668&&p.fontWeight>=700);
      const threshold=fontLarge?3:4.5;
      const result={id:p.id,state:p.state,status:'unsupported',ratio:null,threshold,advisory:null,issues,foreground:null,background:null,declared:{foreground:p.foreground,backgrounds:p.backgrounds.slice(),backdrop:p.backdrop,disabled:p.disabled,fontSize:p.fontSize,fontWeight:p.fontWeight,unsupported:p.unsupported.slice()}};
      if(!C.parse(p.foreground)||!C.parse(p.backdrop)||p.backgrounds.some(x=>!C.parse(x)))issues.push('Unsupported color syntax');
      if(C.parse(p.backdrop)?.a!==1)issues.push('Explicit opaque backdrop required');
      // Empty backgrounds is valid: text directly over the declared opaque canvas.
      if(issues.length)return result;
      let bg=C.parse(p.backdrop);for(const layer of p.backgrounds)bg=C.composite(layer,bg);
      const fg=C.composite(p.foreground,bg);const ratio=C.ratio(fg,bg);
      Object.assign(result,{ratio,foreground:fg,background:bg,status:p.disabled?'exempt':C.passes(ratio,threshold)?'pass':'fail'});
      if(p.disabled)result.advisory=ratio<threshold?'Low disabled-text readability. Consider a stronger foreground or less transparency; this is an advisory, not a WCAG failure.':'Disabled text is exempt from the contrast criterion. Its measured readability is provided for design review, not a conformance pass.';
      return result;
    });
    const summary={pass:0,fail:0,exempt:0,unsupported:0};for(const r of results)summary[r.status]++;
    return {schemaVersion:1,source,auditedAt:new Date().toISOString(),algorithm:{name:'WCAG 2.x sRGB contrast',version:'statelens-0.2.0',compositing:'Source-over in encoded sRGB; outermost to innermost backgrounds; unrounded channels',thresholds:'4.5 normal text; 3 large text (24px or 18.666666666666668px bold >=700); disabled exempt'},scope:'Captured solid-sRGB text pairs only; not a page accessibility audit.',results,summary,exitCode:summary.unsupported?2:summary.fail?1:0};
  }
  const api={audit,MAX_BYTES,MAX_PAIRS};root.Snapshot=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
