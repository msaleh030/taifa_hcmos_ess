// Login — entry point. Email + PIN, plus role quick-launch for the demo.
function Login({ onLogin }){
  const [sel,setSel] = React.useState('hrhead');
  const [pin,setPin] = React.useState('');
  const role = roleById(sel);
  const flag = ['#1FA24A','#FBC02D','#15191D','#0094D4'];
  const submit = () => onLogin(sel);
  return <div className="login">
    {/* brand panel */}
    <div className="login-brand">
      <div className="lb-top">
        <img src={(window.__resources&&window.__resources.taifaLogo)||"assets/taifa-logo.png"} alt="Taifa" className="lb-logo"/>
      </div>
      <div className="lb-mid">
        <div className="lb-flag">{flag.map((c,i)=><span key={i} style={{background:c}}/>)}</div>
        <div className="lb-eyebrow">HCMOS&trade;</div>
        <h1>Human Capital Management<br/>Operating System</h1>
        <p>One authoritative workforce platform for Taifa Mining &amp; Civil — core HR, time &amp; attendance,
           performance, safety and self-service, across every site.</p>
        <div className="lb-stats">
          <div><b className="num">{(typeof TOTAL_HC!=='undefined'?TOTAL_HC:0).toLocaleString()}</b><span>employees</span></div>
          <div><b className="num">{(typeof SITES!=='undefined'?SITES.length:0)}</b><span>sites</span></div>
          <div><b className="num">{(typeof ROLES!=='undefined'?ROLES.length:0)}</b><span>roles</span></div>
        </div>
      </div>
      <div className="lb-foot">RailGrid Technologies Limited · HCMOS&trade; Management Suite + ESS · v1.0</div>
    </div>

    {/* form panel */}
    <div className="login-form">
      <div className="lf-inner">
        <div className="lf-head">
          <div className="lf-t">Sign in</div>
          <div className="lf-s">Use your work email and PIN. Access is role-based.</div>
          <div style={{marginTop:12}}><LangSwitch/></div>
        </div>

        <label className="lf-field">
          <span>Work email</span>
          <div className="lf-input"><Icon name="users" size={16}/><input value={role.email} readOnly/></div>
        </label>
        <label className="lf-field">
          <span>PIN</span>
          <div className="lf-input"><Icon name="shield" size={16}/>
            <input type="password" placeholder="• • • • • •" value={pin} maxLength={6}
              onChange={e=>setPin(e.target.value.replace(/\D/g,''))} onKeyDown={e=>e.key==='Enter'&&submit()}/></div>
        </label>
        <button className="btn primary lf-go" onClick={submit}>
          Sign in as {role.title}<Icon name="chevR" size={16}/></button>
        <div className="lf-help"><Icon name="phone" size={14}/> 24/7 site support · 0800-TAIFA-HR</div>

        <div className="lf-div"><span>or continue as a role (demo)</span></div>
        <div className="lf-roles">
          {ROLES.map(r=><button key={r.id} className={'lf-role '+(sel===r.id?'on':'')} onClick={()=>setSel(r.id)}>
            <span className="avatar" style={{background:r.id===sel?'var(--accent)':'var(--faint)'}}>{r.initials}</span>
            <span className="lf-role-t"><b>{r.name}</b><i>{r.title}</i></span>
            {r.mobile&&<Tag tone="blue">Mobile</Tag>}
            {sel===r.id&&<Icon name="check" size={16} style={{color:'var(--accent)',marginLeft:'auto'}}/>}
          </button>)}
        </div>
      </div>
    </div>
  </div>;
}
window.Login = Login;
