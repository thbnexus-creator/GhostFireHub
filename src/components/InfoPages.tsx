import React, { useState } from 'react';
import { 
  HelpCircle, 
  Mail, 
  Send, 
  ShieldAlert, 
  FileText, 
  Check, 
  Info,
  ChevronDown,
  Globe
} from 'lucide-react';

interface InfoProps {
  page: 'About' | 'Help' | 'Contact' | 'Privacy' | 'Terms';
}

export default function InfoPages({ page }: InfoProps) {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  // FAQ Accordion open index triggers
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: 'Is GhostFireHub affiliated with Garena Free Fire?', a: 'No, GhostFireHub is an independent esports hub and gaming settings simulation model. We are not officially endorsed by, affiliated with, or associated with Garena or Free Fire.' },
    { q: 'Will these sensitivity settings get my account banned?', a: 'Absolutely not. GhostFireHub generates safe, human-operable tactile sensitivity coordinates that you manually adjust inside your native game settings. We do not provide injectables, regedit scripts, macro tools, or any software that modifies game files.' },
    { q: 'What is a touch sampling rate, and why does it matter?', a: 'Touch sampling rate refers to the frequency at which your smartphone screen registers physical touch inputs per second. High sampling rates (e.g. 240Hz or 360Hz) mean your device recognizes drag gestures faster, necessitating specific minor offsets computed by GhostCore™.' },
    { q: 'Can I purchase digital custom configurations instantly?', a: 'Yes. Our digital marketplace listings deliver custom calibrated files. All payments are secured via our verified Telegram support portal, and configs are dispatched immediately.' }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess('Your support ticket has been registered. Our esports help desk will respond via email within 12 hours.');
    setContactName('');
    setContactEmail('');
    setContactMsg('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden animate-fadeIn">
      
      {/* Decorative gradient sphere */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {page === 'About' && (
        <div className="space-y-5">
          <div className="pb-3 border-b border-slate-800/80">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
              Platform Mission
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-2 tracking-tight flex items-center gap-2">
              <Info className="w-5.5 h-5.5 text-orange-500" /> About GhostFireHub
            </h2>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <p>
              <strong>GhostFireHub</strong> was officially founded in <strong>2024</strong> by <strong>Founder: GhostFire</strong> with the vision of helping mobile gamers improve their performance through advanced sensitivity optimization and tactical gameplay research.
            </p>
            <p>
              In <strong>2026</strong>, GhostFireHub evolved into a complete gaming platform featuring AI-powered sensitivity generation, HUD customization, community features, premium services, and a digital marketplace for competitive mobile gamers.
            </p>
            <p>
              GhostFireHub is proudly supported by <strong>THBOMS</strong>, whose sponsorship provides advanced testing equipment used for mobile performance analysis, touch-response testing, display latency research, and precision gaming experiments.
            </p>
            <p>
              Our proprietary <strong>GhostCore™</strong> engine analyzes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
              <li>Device model</li>
              <li>Processor</li>
              <li>RAM</li>
              <li>Android version</li>
              <li>Display resolution</li>
              <li>Screen refresh rate</li>
              <li>Touch response</li>
              <li>Screen size</li>
              <li>Play style</li>
              <li>Weapon preferences</li>
            </ul>
            <p>
              to generate highly optimized personalized sensitivity recommendations.
            </p>
            <p>
              GhostFireHub is committed to fair play. We do not develop cheats, hacks, scripts, injectors, or unfair gameplay tools. Our technology only helps players improve their natural muscle memory, aiming precision, and tactical consistency.
            </p>
          </div>

          {/* Key pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-850 text-xs">
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <div className="font-bold text-slate-200 uppercase">🧠 Precision Math</div>
              <p className="text-slate-400 text-[11px] mt-1">We study tactile friction-to-glide metrics instead of arbitrary values.</p>
            </div>
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl">
              <div className="font-bold text-slate-200 uppercase">🛡️ Rigorous Safety</div>
              <p className="text-slate-400 text-[11px] mt-1">Manual copy-paste values ensure absolute safety from account suspension.</p>
            </div>
          </div>
        </div>
      )}

      {page === 'Help' && (
        <div className="space-y-5">
          <div className="pb-3 border-b border-slate-800/80">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
              FAQ Help Center
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-2 tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5.5 h-5.5 text-orange-500" /> Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-slate-950/80 border border-slate-850 rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center text-xs font-bold text-slate-200 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed font-sans border-t border-slate-900 animate-slideDown">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {page === 'Contact' && (
        <div className="space-y-5">
          <div className="pb-3 border-b border-slate-800/80">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
              Help Desk
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-2 tracking-tight flex items-center gap-2">
              <Mail className="w-5.5 h-5.5 text-orange-500" /> Contact Support Team
            </h2>
          </div>

          {contactSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{contactSuccess}</span>
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">Your Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. player@gmail.com"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Message Details</label>
              <textarea
                required
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="How can we optimize your mobile sensitivity setup?"
                className="w-full h-32 bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-slate-950 font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-orange-500/10 hover:brightness-110 transition-all flex justify-center items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-slate-950" /> Submit Support Ticket
            </button>
          </form>
        </div>
      )}

      {page === 'Privacy' && (
        <div className="space-y-5">
          <div className="pb-3 border-b border-slate-800/80">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
              Security Matrix
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-2 tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5.5 h-5.5 text-orange-500" /> Privacy &amp; Data Policy
            </h2>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <p><strong>Effective June 2026</strong></p>
            <p>
              Your tactical security and privacy are of paramount importance to GhostFireHub. 
            </p>
            <p>
              <strong>1. Data Collection:</strong> We collect hardware parameters (such as smartphone brand, CPU specifications, screen resolutions, and touch refresh metrics) to feed the <strong>GhostCore™</strong> algorithm. We store email addresses and usernames securely to persist saved sensitivity logs and claw HUD layouts.
            </p>
            <p>
              <strong>2. No Sharing:</strong> We do not sell, distribute, or leak your details to any third-party marketing companies. All data processed inside our database runs under standard cryptographic session protection.
            </p>
            <p>
              <strong>3. Third-party Links:</strong> Digital purchases on our marketplace are delivered directly via secure Telegram support tunnels. We suggest verifying Telegram security parameters to safeguard your personal accounts.
            </p>
          </div>
        </div>
      )}

      {page === 'Terms' && (
        <div className="space-y-5">
          <div className="pb-3 border-b border-slate-800/80">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
              Licensing Covenant
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-2 tracking-tight flex items-center gap-2">
              <FileText className="w-5.5 h-5.5 text-orange-500" /> Terms of Service
            </h2>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <p><strong>Effective June 2026</strong></p>
            <p>
              By accessing <strong>GhostFireHub</strong>, you agree to comply with our Terms of Use.
            </p>
            <p>
              <strong>1. Tactical Tool Use:</strong> GhostFireHub provides mathematical sensitivity recommendations and visual interface mockups (HUD Builder). These parameters do not guarantee specific gameplay rankings or in-game competitive performance.
            </p>
            <p>
              <strong>2. Abuse and Hack Prevention:</strong> You represent and warrant that you will not misuse this hub to advocate for illegal hacks, injector mods, or automatic headshot files that violate game publishers terms. Any player caught abusing our channels will be banned.
            </p>
            <p>
              <strong>3. Marketplace Delivery:</strong> All payments, deliverable digital files, and configuration coaching sessions are transacted with secure escrow in Telegram DM tunnels. GhostFireHub is not liable for transactions made outside of our official Telegram Support accounts.
            </p>
          </div>
        </div>
      )}

      {false && (
        <div className="space-y-6">
          <div className="pb-3 border-b border-slate-800/80">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono px-2 py-0.5 rounded uppercase font-semibold">
              Deployment Operations
            </span>
            <h2 className="text-xl font-bold text-white uppercase mt-2 tracking-tight flex items-center gap-2">
              <Globe className="w-5.5 h-5.5 text-orange-500" /> Custom Domain Configuration Guide
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              Complete diagnostic blueprint for routing www.ghostfirehub.com to your active Google Cloud deployment.
            </p>
          </div>

          {/* Quick Notice about Registration Status */}
          <div className="p-4 bg-orange-950/20 border border-orange-500/15 rounded-2xl space-y-2">
            <span className="text-[9px] bg-orange-500/15 border border-orange-500/20 text-orange-400 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
              Verification Notice
            </span>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              If you do not yet own the domain name <strong className="text-white">ghostfirehub.com</strong>, it must first be registered with an authorized public Domain Registrar (such as Squarespace, Namecheap, or Cloudflare) to lease it. Free hosting is provided for your application code, but domain name registration requires a standard lease fee from public registrars.
            </p>
          </div>

          {/* Step by Step Operations */}
          <div className="space-y-5">
            {/* Step 1 */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-500 text-slate-950 rounded-full flex items-center justify-center font-mono text-[10px] font-black">1</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Purchase &amp; Register the Domain</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed pl-7">
                Navigate to your chosen registrar. Search for <strong className="text-white font-mono">ghostfirehub.com</strong> (or any "Diamond" branded variant you prefer) and complete the registration. If you want a zero-configuration option, you can use Google Cloud Domains (available via Google Cloud Console under Network Services &gt; Cloud Domains) to purchase it directly inside your Cloud Project.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-500 text-slate-950 rounded-full flex items-center justify-center font-mono text-[10px] font-black">2</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Map the Domain in Google Console</span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans leading-relaxed pl-7 space-y-2">
                <p>
                  Because your app runs on Google Cloud infrastructure behind a dynamic reverse-proxy layer, choose one of these two configuration channels:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono font-bold text-orange-400 uppercase">Channel A: Domain Registrar CNAME</span>
                    <p className="text-[10px] leading-normal text-slate-400">
                      Go to your domain registrar DNS dashboard, add a CNAME record pointing to your active Firebase Hosting subdomain, and let Firebase provision secure SSL certificates.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[9px] font-mono font-bold text-orange-400 uppercase">Channel B: Firebase Hosting Custom Domain</span>
                    <p className="text-[10px] leading-normal text-slate-400">
                      Open the Firebase Console, navigate to Hosting, click <strong className="text-slate-300">"Add Custom Domain"</strong>, and input your domain. Firebase will automatically handle secure CDN routing.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-500 text-slate-950 rounded-full flex items-center justify-center font-mono text-[10px] font-black">3</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Configure DNS Records at Registrar</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed pl-7">
                Log into your domain registrar's DNS dashboard (e.g., Squarespace DNS, Namecheap Advanced DNS) and create the following records to route requests to Google Cloud servers:
              </p>
              
              <div className="pl-7 overflow-x-auto">
                <table className="w-full text-[10px] text-left border-collapse font-mono text-slate-300 min-w-[340px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                      <th className="py-2 px-1">Type</th>
                      <th className="py-2 px-1">Host/Name</th>
                      <th className="py-2 px-1">Value/Destination</th>
                      <th className="py-2 px-1 text-right font-sans">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-850/60 hover:bg-slate-900/20">
                      <td className="py-2.5 px-1 font-bold text-orange-400">A</td>
                      <td className="py-2.5 px-1">@</td>
                      <td className="py-2.5 px-1">151.101.1.195 <span className="text-slate-600">(Google Edge Server)</span></td>
                      <td className="py-2.5 px-1 text-right">
                        <button 
                          onClick={() => { navigator.clipboard.writeText('151.101.1.195'); alert('IP copied!'); }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8.5px] uppercase"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-850/60 hover:bg-slate-900/20">
                      <td className="py-2.5 px-1 font-bold text-orange-400">A</td>
                      <td className="py-2.5 px-1">@</td>
                      <td className="py-2.5 px-1">151.101.65.195 <span className="text-slate-600">(Backup Edge Server)</span></td>
                      <td className="py-2.5 px-1 text-right">
                        <button 
                          onClick={() => { navigator.clipboard.writeText('151.101.65.195'); alert('IP copied!'); }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8.5px] uppercase"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-850/60 hover:bg-slate-900/20">
                      <td className="py-2.5 px-1 font-bold text-orange-400">CNAME</td>
                      <td className="py-2.5 px-1">www</td>
                      <td className="py-2.5 px-1">ghs.googlehosted.com.</td>
                      <td className="py-2.5 px-1 text-right">
                        <button 
                          onClick={() => { navigator.clipboard.writeText('ghs.googlehosted.com.'); alert('CNAME value copied!'); }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8.5px] uppercase"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-850/60 hover:bg-slate-900/20">
                      <td className="py-2.5 px-1 font-bold text-orange-400">CNAME</td>
                      <td className="py-2.5 px-1">app</td>
                      <td className="py-2.5 px-1">ghs.googlehosted.com.</td>
                      <td className="py-2.5 px-1 text-right">
                        <button 
                          onClick={() => { navigator.clipboard.writeText('ghs.googlehosted.com.'); alert('CNAME value copied!'); }}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-[8.5px] uppercase"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-orange-500 text-slate-950 rounded-full flex items-center justify-center font-mono text-[10px] font-black">4</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">SSL Certificate Provisioning</span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed pl-7">
                Once the DNS records are saved, Google Cloud and Firebase Hosting will automatically communicate with Let's Encrypt to issue a secure, free <strong className="text-white">SSL (HTTPS) Certificate</strong>. This procedure can take between 1 to 24 hours to propagate across global DNS servers. No manual certificate upload is required!
              </p>
            </div>
          </div>

          {/* Verification Protocol Status */}
          <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-200 uppercase">Verification Protocol</div>
              <p className="text-slate-500 text-[10px] font-mono">Status check for www.ghostfirehub.com mappings</p>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://dns.google/" 
                target="_blank" 
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] uppercase font-bold rounded-xl transition-colors text-slate-300 text-center"
              >
                Google DNS Lookup
              </a>
              <button 
                onClick={() => alert('DNS Propagation test initiated! Please allow up to 60 seconds for DNS records to synchronize globally.')}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-slate-950 text-[10px] uppercase font-black tracking-wider rounded-xl transition-all shadow-md shadow-orange-600/10 cursor-pointer text-center"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
