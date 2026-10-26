/* StateLens v0.2 — paste into your own page's DevTools, then call
   StateLensCapture($0, { backdrop: '#FFFFFF', confirmUnobscured: true }).
   Supply the actual opaque canvas color and visually confirm the element is
   not obscured by overlays. The function does not click, force states, read
   page text/URLs, fetch resources, or send data. Review JSON before exporting.
   Text-only: borders, icons, focus-ring geometry and other states are not audited. */
(function(root){
  'use strict';
  root.StateLensCapture=function(element,options={}){
    if(!element||element.nodeType!==1||!element.ownerDocument)throw new Error('Select a rendered element, e.g. $0 in DevTools.');
    const view=element.ownerDocument.defaultView;
    if(!view||!element.isConnected)throw new Error('Element must be connected to a rendered document.');
    const unsupported=new Set(), backgrounds=[];
    if(options.confirmUnobscured!==true)unsupported.add('Visually verify overlapping content; then explicitly set confirmUnobscured: true');
    if(typeof options.backdrop!=='string')unsupported.add('Declare the actual opaque canvas backdrop');
    const style=view.getComputedStyle(element);
    const rect=element.getBoundingClientRect();
    if(['SVG','IMG','CANVAS','VIDEO','IFRAME','OBJECT','EMBED'].includes(element.tagName.toUpperCase())||(element.namespaceURI&&element.namespaceURI!=='http://www.w3.org/1999/xhtml'))unsupported.add('Only HTML text elements are supported');
    try{if(element.matches(':placeholder-shown'))unsupported.add('Placeholder rendering requires separate manual review');}catch{}
    if(parseFloat(style.getPropertyValue('-webkit-text-stroke-width'))>0)unsupported.add('Text stroke is not modeled');
    if(style.backgroundClip==='text'||style.getPropertyValue('-webkit-background-clip')==='text')unsupported.add('Background-clipped text is not modeled');
    if(rect.width<=0||rect.height<=0||style.visibility!=='visible')unsupported.add('Element is not visibly rendered');
    if(element.children.length)unsupported.add('Nested descendants may have different text styles; select a leaf text element');
    if(style.textShadow!=='none')unsupported.add('Text shadow is not modeled');
    const fill=style.getPropertyValue('-webkit-text-fill-color');
    if(fill&&fill!==style.color)unsupported.add('Text fill differs from CSS color');
    let node=element, depth=0, selectedDisabled=false;
    try{selectedDisabled=element.matches(':disabled')||element.getAttribute('aria-disabled')==='true';}catch{}
    while(node&&node.nodeType===1&&depth<50){
      const css=view.getComputedStyle(node);
      if(node!==element){try{if(node.matches(':disabled')||node.getAttribute('aria-disabled')==='true')unsupported.add('Disabled ancestor semantics require manual review; no inherited exemption is assumed');}catch{}}
      backgrounds.unshift(css.backgroundColor);
      // A computed ancestor color is not proof that its painted box covers this text.
      const box=node.getBoundingClientRect();
      if(![rect.left,rect.top,rect.right,rect.bottom,box.left,box.top,box.right,box.bottom].every(Number.isFinite))unsupported.add('Paint geometry is unavailable');
      else if(rect.left<box.left||rect.top<box.top||rect.right>box.right||rect.bottom>box.bottom)unsupported.add('Target extends outside an ancestor painting box');
      if(css.backgroundClip&&css.backgroundClip!=='border-box')unsupported.add('Nondefault background clipping is not modeled');
      if(css.clipPath&&css.clipPath!=='none')unsupported.add('Clip paths are not modeled');
      if(css.clip&&css.clip!=='auto')unsupported.add('Legacy clipping is not modeled');
      if(['borderTopLeftRadius','borderTopRightRadius','borderBottomLeftRadius','borderBottomRightRadius'].some(k=>css[k]&&css[k].split(/[\s/]+/).some(v=>parseFloat(v)!==0)))unsupported.add('Rounded painting boxes require manual review');
      if(css.transform&&css.transform!=='none')unsupported.add('Transformed painting geometry is not modeled');
      if(css.backgroundImage!=='none')unsupported.add('Background images or gradients are not modeled');
      if(Number(css.opacity)!==1)unsupported.add('Element or ancestor group opacity is not modeled');
      if(css.filter!=='none'||(css.backdropFilter&&css.backdropFilter!=='none'))unsupported.add('Filters are not modeled');
      if(css.mixBlendMode!=='normal'||(css.backgroundBlendMode&&css.backgroundBlendMode!=='normal'))unsupported.add('Blend modes are not modeled');
      if(css.boxShadow!=='none')unsupported.add('Box shadows may affect the adjacent background');
      if(css.maskImage&&css.maskImage!=='none')unsupported.add('Masks are not modeled');
      for(const pseudo of ['::before','::after']){const p=view.getComputedStyle(node,pseudo);if(p.content&&p.content!=='none'&&p.content!=='normal')unsupported.add('Generated pseudo-element content requires manual review');}
      node=node.parentElement;depth++;
    }
    if(node)unsupported.add('Ancestor limit reached');
    if(element.getRootNode()!==element.ownerDocument)unsupported.add('Shadow DOM background ancestry is not supported');
    const disabled=selectedDisabled;
    let focus=false;try{focus=element.matches(':focus-visible');}catch{}
    const error=element.getAttribute('aria-invalid')==='true';
    return {schemaVersion:1,source:{kind:'computed-style',capturedAt:new Date().toISOString(),scope:'One observed text element; no text, page URL or selector collected. Overlay absence and canvas color are user-declared.'},pairs:[{id:'selected-'+element.tagName.toLowerCase(),state:[disabled?'disabled':'active',focus?'focus-visible':null,error?'error':null].filter(Boolean).join('+'),foreground:style.color,backgrounds,backdrop:typeof options.backdrop==='string'?options.backdrop:'transparent',disabled,fontSize:parseFloat(style.fontSize),fontWeight:Number(style.fontWeight),unsupported:[...unsupported]}]};
  };
})(typeof globalThis!=='undefined'?globalThis:this);
