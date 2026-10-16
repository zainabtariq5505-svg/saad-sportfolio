document.addEventListener('DOMContentLoaded', () => {
    const mark = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="ai-spark-gradient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#bba5ff"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#67e8f9"/></linearGradient></defs><path d="M20 3C23 14 26 17 37 20C26 23 23 26 20 37C17 26 14 23 3 20C14 17 17 14 20 3Z" fill="url(#ai-spark-gradient)"/><circle cx="33" cy="7" r="2" fill="#a5f3fc"/></svg>`;
    const root=document.createElement('div');
    root.innerHTML=`<button id="ai-launcher" class="ai-launcher" type="button" aria-haspopup="dialog">${mark}<span>Saad AI</span></button>
    <dialog id="ai-panel" class="ai-panel" aria-labelledby="ai-title"><header class="ai-header"><span class="ai-brand">${mark}<span><strong id="ai-title">Saad AI</strong><small>AI portfolio guide · Powered by AZOZ’s intelligence</small></span></span><button id="ai-close" type="button" aria-label="Close Saad AI">×</button></header><div id="ai-messages" class="ai-messages" role="log" aria-live="polite"><p class="ai-bubble">Hey! Curious about Saad’s skills, projects, or learning journey? Ask away.</p></div><div class="ai-suggestions"><button type="button" data-question="What is Saad learning?">Learning journey</button><button type="button" data-question="What skills does Saad have?">Skills</button><button type="button" data-question="Tell me about this portfolio project.">Projects</button></div><p id="ai-status" class="ai-status" role="status"></p><form id="ai-form"><label class="ai-sr-only" for="ai-input">Ask Saad AI</label><input id="ai-input" maxlength="1000" placeholder="Ask about Saad’s portfolio…" required autocomplete="off"><button id="ai-send" type="submit" aria-label="Send question">↑</button></form><footer class="ai-footer"><span>Chats go to Groq. AI can make mistakes.</span><button id="ai-clear" type="button">Clear chat</button><a href="#contact" id="ai-contact">Contact Saad</a></footer></dialog>`;
    document.body.append(root);
    const panel=document.getElementById('ai-panel'), input=document.getElementById('ai-input'), log=document.getElementById('ai-messages'), status=document.getElementById('ai-status');
    const launcher=document.getElementById('ai-launcher');
    let messages=[],busy=false;
    const close=()=>{panel.close();launcher.focus();};
    launcher.addEventListener('click',()=>{panel.showModal();input.focus();});
    document.getElementById('ai-close').addEventListener('click',close);
    document.getElementById('ai-contact').addEventListener('click',()=>{close();document.getElementById('contact').scrollIntoView({behavior:'smooth'});});
    const add=(text,user=false)=>{const row=document.createElement('p');row.className='ai-bubble'+(user?' ai-user':'');row.textContent=text;log.append(row);log.scrollTop=log.scrollHeight;};
    const send=async question=>{
        if(busy||!question.trim())return;
        busy=true;
        input.value='';add(question,true);status.textContent='Saad AI is thinking…';panel.classList.add('ai-thinking');
        document.querySelectorAll('#ai-panel button:not(#ai-close)').forEach(b=>b.disabled=true);
        try {
            const request=[...messages.slice(-8),{role:'user',content:question}];
            const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:request}),signal:AbortSignal.timeout(30000)});
            const data=await response.json();
            if(!response.ok)throw new Error(data.error||'Could not connect. Please retry.');
            add(data.reply);messages=[...request,{role:'assistant',content:data.reply.slice(0,1000)}];status.textContent='';
        }catch(error){status.textContent=error.name==='TimeoutError'?'Taking longer than expected. Please try again.':error.message;input.value=question;}
        finally{busy=false;panel.classList.remove('ai-thinking');document.querySelectorAll('#ai-panel button').forEach(b=>b.disabled=false);}
    };
    document.getElementById('ai-form').addEventListener('submit',e=>{e.preventDefault();send(input.value.trim());});
    document.querySelectorAll('[data-question]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.question)));
    document.getElementById('ai-clear').addEventListener('click',()=>{if(busy)return;messages=[];log.replaceChildren();add('A fresh start. What would you like to know?');status.textContent='';input.value='';input.focus();});
});
