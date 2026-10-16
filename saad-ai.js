document.addEventListener('DOMContentLoaded', () => {
    const mark = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="ai-spark-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bba5ff"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#67e8f9"/></linearGradient></defs><path d="M20 3C23 14 26 17 37 20C26 23 23 26 20 37C17 26 14 23 3 20C14 17 17 14 20 3Z" fill="url(#ai-spark-gradient)"/><circle cx="33" cy="7" r="2" fill="#a5f3fc"/></svg>`;
    const root=document.createElement('div');
    root.innerHTML=`<button id="ai-launcher" class="ai-launcher" type="button" aria-haspopup="dialog">${mark}<span>Saad AI</span></button>
    <dialog id="ai-panel" class="ai-panel" aria-labelledby="ai-title"><header class="ai-header"><span class="ai-brand">${mark.replaceAll('ai-spark-gradient','ai-header-gradient')}<span><strong id="ai-title">Saad AI</strong><small>AI portfolio guide · Powered by AZOZ’s intelligence</small></span></span><button id="ai-close" type="button" aria-label="Close Saad AI">×</button></header><div id="ai-messages" class="ai-messages" role="log" aria-live="polite"><p class="ai-bubble">Hey! Curious about Saad’s skills, projects, or learning journey? Ask away.</p></div><div class="ai-suggestions"><button type="button" data-question="What is Saad learning?">Learning journey</button><button type="button" data-question="What skills does Saad have?">Skills</button><button type="button" data-question="Tell me about this portfolio project.">Projects</button></div><div id="ai-thinking-indicator" class="ai-thinking-indicator" role="status" hidden><span>Thinking</span><span class="ai-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="ai-sr-only">…</span></div><p id="ai-status" class="ai-status" role="status"></p><form id="ai-form"><label class="ai-sr-only" for="ai-input">Ask Saad AI</label><input id="ai-input" maxlength="1000" placeholder="Ask about Saad’s portfolio…" required autocomplete="off"><button id="ai-stop" type="button" hidden>■ Stop</button><button id="ai-send" type="submit" aria-label="Send question">↑</button></form><footer class="ai-footer"><span>Chats go to Groq. AI can make mistakes.</span><button id="ai-clear" type="button">Clear chat</button><a href="#contact" id="ai-contact">Contact Saad</a></footer></dialog>`;
    document.body.append(root);
    const panel=document.getElementById('ai-panel'), input=document.getElementById('ai-input'), log=document.getElementById('ai-messages'), status=document.getElementById('ai-status');
    const launcher=document.getElementById('ai-launcher');
    let messages=[],busy=false,controller=null;
    const close=()=>{panel.close();launcher.focus();};
    launcher.addEventListener('click',()=>{panel.showModal();input.focus();});
    document.getElementById('ai-close').addEventListener('click',close);
    document.getElementById('ai-contact').addEventListener('click',()=>{close();document.getElementById('contact').scrollIntoView({behavior:'smooth'});});
    const add=(text,user=false)=>{const row=document.createElement('p');row.className='ai-bubble'+(user?' ai-user':'');row.textContent=text;log.append(row);log.scrollTop=log.scrollHeight;return row;};
    const stop=document.getElementById('ai-stop');
    const thinking=document.getElementById('ai-thinking-indicator');
    stop.addEventListener('click',()=>{if(controller){stop.disabled=true;controller.abort();}});
    const send=async question=>{
        if(busy||!question.trim())return;
        busy=true;controller=new AbortController();
        const request=[...messages.slice(-8),{role:'user',content:question}];
        let answer='',bubble=null,frame=null,complete=false,verified=false;
        const flush=()=>{
            frame=null;
            if(!bubble)return;
            const follow=log.scrollHeight-log.scrollTop-log.clientHeight<90;
            bubble.textContent=answer;
            if(follow)log.scrollTop=log.scrollHeight;
        };
        input.value='';add(question,true);status.textContent='';thinking.hidden=false;panel.classList.add('ai-thinking');
        log.setAttribute('aria-busy','true');
        document.querySelectorAll('#ai-panel button:not(#ai-close):not(#ai-stop)').forEach(b=>b.disabled=true);
        stop.hidden=false;stop.disabled=false;
        try {
            const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:request}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(35000)])});
            if(!response.ok){const data=await response.json();throw new Error(data.error||'Could not connect. Please retry.');}
            const reader=response.body.getReader(),decoder=new TextDecoder();
            let buffer='';
            const event=line=>{
                if(!line.trim())return;
                const data=JSON.parse(line);
                if(data.error)throw new Error(data.error);
                if(data.done){complete=true;verified=data.source==='verified';}
                if(typeof data.delta==='string'){
                    if(!bubble){thinking.hidden=true;bubble=add('');}
                    answer+=data.delta;
                    if(frame===null)frame=requestAnimationFrame(flush);
                }
            };
            try {
                while(true){
                    const {value,done}=await reader.read();
                    buffer+=done?decoder.decode():decoder.decode(value,{stream:true});
                    let end;
                    while((end=buffer.indexOf('\n'))!==-1){event(buffer.slice(0,end));buffer=buffer.slice(end+1);}
                    if(done)break;
                }
                if(buffer.trim())event(buffer);
            } finally {reader.releaseLock();}
            if(controller.signal.aborted)throw new DOMException('Stopped','AbortError');
            if(!complete||!answer)throw new Error('Response interrupted. Please try again.');
            messages=[...request,{role:'assistant',content:answer.slice(0,1000)}];
            status.textContent=verified?'Verified portfolio facts.':'Response complete.';
        }catch(error){
            if(controller.signal.aborted){
                status.textContent=answer?'Stopped. Partial reply kept.':'Stopped.';
                if(answer)messages=[...request,{role:'assistant',content:answer.slice(0,1000)}];
                else input.value=question;
            }else{
                status.textContent=error.name==='TimeoutError'?'Taking longer than expected. Please try again.':error.message;
                input.value=question;
                if(answer)status.textContent+=' Partial reply shown.';
            }
        }finally{
            if(frame!==null)cancelAnimationFrame(frame);flush();
            busy=false;controller=null;thinking.hidden=true;stop.hidden=true;panel.classList.remove('ai-thinking');log.setAttribute('aria-busy','false');
            document.querySelectorAll('#ai-panel button').forEach(b=>b.disabled=false);
        }
    };
    document.getElementById('ai-form').addEventListener('submit',e=>{e.preventDefault();send(input.value.trim());});
    document.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.question)));
    document.getElementById('ai-clear').addEventListener('click',()=>{if(busy)return;messages=[];log.replaceChildren();add('A fresh start. What would you like to know?');status.textContent='';input.value='';input.focus();});
});
