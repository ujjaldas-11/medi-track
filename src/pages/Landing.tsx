import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heartbeat, Sparkle, ChartLineUp, Pill, ChatCircleText, PaperPlaneRight, ArrowRight } from '@phosphor-icons/react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'redistribution' | 'thea'>('thea');

  return (
    <div className="min-h-screen bg-white font-sans text-[#041c2c]">
      {/* Navbar */}
      <header className="w-full h-[80px] bg-white flex items-center justify-between px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <Heartbeat weight="fill" className="text-[#041c2c] text-3xl" />
          <span className="text-[#041c2c] font-bold text-xl tracking-tight">MediTrack</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold text-[#041c2c]">
          <a href="#providers" className="hover:text-gray-500 transition-colors">For Medical Officers</a>
          <a href="#cmos" className="hover:text-gray-500 transition-colors">For CMOs</a>
          <a href="#pharmacists" className="hover:text-gray-500 transition-colors">For Pharmacists</a>
          <a href="#patients" className="hover:text-gray-500 transition-colors">For Patients</a>
        </nav>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="text-[15px] font-semibold text-[#041c2c] hover:text-gray-500 transition-colors uppercase tracking-wider"
          >
            {user ? 'Console' : 'Log In'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full">
        {/* Hero Section Container (Floats with page margins) */}
        <div className="px-4 md:px-8 pb-12 max-w-[1440px] mx-auto mt-4">
          <section className="relative w-full bg-[#041c2c] rounded-[32px] overflow-hidden flex flex-col lg:flex-row items-center min-h-[640px]">
          
          {/* Decorative Glow Background */}
          <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[800px] h-[800px] bg-[#0c5989] rounded-full blur-[120px] opacity-40"></div>
          </div>
          
          {/* Left Text Content */}
          <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 lg:py-24">
            <h1 className="text-[40px] md:text-[56px] lg:text-[64px] leading-[1.05] font-serif tracking-tight text-white mb-6">
              Powering the <br />
              <span className="relative inline-block">
                <span className="relative z-10">future</span>
                <span className="absolute bottom-2 left-0 w-full h-[25%] bg-white/15 z-0"></span>
              </span> of district- <br />
              based care
            </h1>
            
            <p className="text-[16px] md:text-[18px] leading-[1.6] text-white/90 max-w-[460px] font-light mb-10">
              MediTrack connects health centers, medical officers, and pharmacists to make district healthcare the most efficient part of operations.
            </p>
            
            <div>
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="bg-[#00e1b2] hover:bg-[#00c59a] text-[#041c2c] text-[16px] font-bold px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center lg:justify-end pr-0 lg:pr-24 pb-16 lg:pb-0">
             <div className="w-[85%] max-w-[460px] relative">
               <img 
                 src="/hero_mother_child.png" 
                 alt="Mother and Child" 
                 className="w-full h-auto aspect-[4/5] object-cover rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
               />
             </div>
          </div>
        </section>
      </div>

      {/* Solutions Brief Section */}
        <section className="w-full py-20 lg:py-28 bg-white flex justify-center items-center">
          <div className="max-w-[900px] text-center px-4">
            <p className="text-[24px] md:text-[32px] lg:text-[36px] font-serif leading-[1.4] text-[#041c2c] font-light">
              Our suite of solutions—including <span className="font-semibold font-sans">AI Telemetry</span>, <span className="font-semibold font-sans">Inventory Alerts</span>, and <span className="font-semibold font-sans">THEA</span>—uses automation and data-driven insights to make resource tracking, bed allocation, and drug redistribution more efficient for everyone involved.
            </p>
          </div>
        </section>

        {/* Explore the Horizon Suite Section */}
        <section className="w-full bg-gradient-to-b from-[#eaf7f2] to-white rounded-[40px] pt-24 pb-16 px-6 md:px-12">
          <div className="max-w-[1280px] mx-auto text-center">
            
            {/* Title with Sparkle Icon */}
            <h2 className="text-[36px] md:text-[48px] font-serif text-[#041c2c] leading-tight flex items-center justify-center gap-3">
              Explore the 
              <span className="inline-flex items-center text-[#00c59a] animate-pulse">
                <Sparkle weight="fill" size={32} />
              </span>
              Horizon Suite
            </h2>

            {/* Subtitle */}
            <p className="text-[16px] md:text-[18px] text-[#4A5568] max-w-[700px] mx-auto mt-6 mb-16 leading-relaxed">
              Our AI-powered solutions are redefining innovation in district care—delivering smarter, faster, and more connected experiences for administrators and medical officers alike.
            </p>

            {/* Three Columns Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-gray-150">
              
              {/* Column 1 */}
              <div 
                onClick={() => setActiveTab('telemetry')}
                className={`pt-8 cursor-pointer border-t-[4px] transition-all duration-300 ${activeTab === 'telemetry' ? 'border-[#00e1b2] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#eceefb] flex items-center justify-center mb-6">
                  <ChartLineUp weight="bold" className="text-[#5c6bc0] text-2xl" />
                </div>
                <h3 className="text-[18px] font-bold text-[#041c2c] mb-3">AI Telemetry</h3>
                <p className="text-[14px] text-[#4A5568] leading-relaxed">
                  Monitor ICU capacities, oxygen cylinders, and daily OPD footfall instantly through our centralized command console.
                </p>
              </div>

              {/* Column 2 */}
              <div 
                onClick={() => setActiveTab('redistribution')}
                className={`pt-8 cursor-pointer border-t-[4px] transition-all duration-300 ${activeTab === 'redistribution' ? 'border-[#00e1b2] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#fff3e0] flex items-center justify-center mb-6">
                  <Pill weight="bold" className="text-[#fb8c00] text-2xl" />
                </div>
                <h3 className="text-[18px] font-bold text-[#041c2c] mb-3">Inventory Alerts</h3>
                <p className="text-[14px] text-[#4A5568] leading-relaxed">
                  Turn surplus drug data into automated redistribution orders. Minimize waste and ensure vital medicines reach deficit centers.
                </p>
              </div>

              {/* Column 3 */}
              <div 
                onClick={() => setActiveTab('thea')}
                className={`pt-8 cursor-pointer border-t-[4px] transition-all duration-300 ${activeTab === 'thea' ? 'border-[#00e1b2] opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#fffde7] flex items-center justify-center mb-6">
                  <ChatCircleText weight="bold" className="text-[#fbc02d] text-2xl" />
                </div>
                <h3 className="text-[18px] font-bold text-[#041c2c] mb-3">MediTrack Expert Assistant (THEA)</h3>
                <p className="text-[14px] text-[#4A5568] leading-relaxed">
                  Handles common order inquiries automatically and routes nuanced resource issues to support staff with context.
                </p>
              </div>
            </div>
            {/* MacBook Pro Mockup */}
            <div className="relative mt-16 max-w-[900px] mx-auto px-2 md:px-10">
              
              {/* Overlapping Floating Element (CPAP Mask style, but styled for District Care - a premium clinical card) */}
              <div className="absolute left-[-20px] bottom-[60px] z-30 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-150 flex items-center gap-3 max-w-[210px] select-none pointer-events-none transition-transform hover:scale-105">
                <div className="w-10 h-10 rounded-full bg-[#eaf7f2] flex items-center justify-center text-[#00c59a]">
                  <Pill size={22} weight="fill" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold text-[#00c59a] uppercase block tracking-wider">Inventory</span>
                  <span className="text-[13px] font-semibold text-[#041c2c]">Re-stocked PHC-3</span>
                </div>
              </div>

              {/* Laptop Screen Bezel */}
              <div className="bg-[#0c0d0e] rounded-t-3xl p-4 md:p-6 shadow-[0_30px_60px_rgba(4,28,44,0.18)] relative border border-gray-900">
                
                {/* Webcam */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#1b1c1d] flex items-center justify-center">
                  <span className="w-0.5 h-0.5 rounded-full bg-blue-950" />
                </div>

                {/* Screen Display Area */}
                <div className="bg-[#f3f4f6] rounded-md overflow-hidden border border-[#2d2e30] aspect-[16/10] relative flex flex-col font-sans select-none shadow-inner">
                  
                  {/* Mock Dashboard Table Background (Greyed out for focus) */}
                  <div className="w-full h-full bg-[#f9fafb] p-4 flex flex-col text-left opacity-30 pointer-events-none">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">telemetry_active_logs</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/4" />
                      <div className="space-y-2">
                        <div className="h-9 bg-gray-200 rounded" />
                        <div className="h-9 bg-gray-200 rounded" />
                        <div className="h-9 bg-gray-200 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Tab Overlay (Active Component in Foreground) */}
                  <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
                    
                    {activeTab === 'telemetry' && (
                      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(4,28,44,0.12)] border border-gray-100 p-5 w-full max-w-[380px] animate-fade-in text-left">
                        <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-4">
                          <span className="text-[13px] font-bold text-[#041c2c]">AI Telemetry Dashboard</span>
                          <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-700 font-semibold rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Telemetry
                          </span>
                        </div>
                        <div className="space-y-3 font-mono text-[11px] text-[#4A5568]">
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
                            <span>ICU Occupancy:</span>
                            <span className="font-bold text-[#041c2c]">86.4% (Critical)</span>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex justify-between">
                            <span>Staff Attendance:</span>
                            <span className="font-bold text-[#041c2c]">94.8% (Stable)</span>
                          </div>
                          <div className="p-3 bg-[#eaf7f2] rounded-xl border border-[#00e1b2]/20 flex justify-between">
                            <span>Oxygen Stock:</span>
                            <span className="font-bold text-[#023b35]">98% (Secure)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'redistribution' && (
                      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(4,28,44,0.12)] border border-gray-100 p-5 w-full max-w-[380px] animate-fade-in text-left">
                        <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-4">
                          <span className="text-[13px] font-bold text-[#041c2c]">Smart Redistribution</span>
                          <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-full">Redistribution Active</span>
                        </div>
                        <div className="space-y-2">
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px]">
                            <span className="text-[9px] text-amber-600 font-bold block uppercase tracking-wider">Surplus Alert (PHC-1)</span>
                            <h4 className="font-bold text-[#041c2c] mt-0.5">Paracetamol 500mg (2,500 surplus)</h4>
                          </div>
                          <div className="p-3 bg-[#eaf7f2] rounded-xl border border-[#00e1b2]/20 text-[11px] flex justify-between items-center">
                            <div>
                              <span className="text-[9px] text-emerald-600 font-bold block uppercase tracking-wider">Approved Transfer (PHC-3)</span>
                              <h4 className="font-bold text-[#041c2c] mt-0.5">Transfer request sent successfully</h4>
                            </div>
                            <span className="text-[9px] bg-[#00e1b2] text-[#041c2c] font-bold px-2 py-0.5 rounded-full">Dispatched</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'thea' && (
                      <div className="bg-white rounded-2xl shadow-[0_25px_50px_rgba(4,28,44,0.14)] border border-gray-100 p-4 w-full max-w-[400px] animate-fade-in text-left flex flex-col justify-between h-[85%]">
                        
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                          <div className="flex gap-4 text-[12px] font-bold text-[#041c2c]">
                            <span className="border-b-[3px] border-[#00e1b2] pb-2 -mb-[13px] text-[#041c2c]">Messages</span>
                            <span className="text-gray-400 font-normal">Timeline</span>
                          </div>
                          <span className="text-gray-400 text-xs">▲</span>
                        </div>

                        {/* Drawer Messages list */}
                        <div className="flex-grow flex flex-col justify-center py-2">
                          <div className="bg-amber-50/70 border border-amber-100/70 rounded-xl p-3 flex gap-3 items-start">
                            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-xs shrink-0 select-none">💬</div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Have any questions about this request?</p>
                              <p className="text-[12px] text-[#041c2c] font-bold mt-0.5">
                                Ask THEA, MediTrack's AI assistant.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Input Field with Arrow */}
                        <div className="border border-gray-200 rounded-xl p-2 flex justify-between items-center bg-gray-50">
                          <span className="text-[11px] text-[#041c2c] font-medium pl-1.5">What's the status of this order?</span>
                          <button className="w-8 h-8 rounded-lg bg-[#eaf7f2] hover:bg-[#00e1b2]/20 flex items-center justify-center text-[#00c59a] transition-all">
                            <PaperPlaneRight size={15} weight="fill" />
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Laptop Keyboard Base (Lip) */}
              <div className="bg-[#2a2b2d] h-3.5 rounded-b-3xl relative w-full border-t border-[#3a3b3d] shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-2 bg-[#1b1c1d] rounded-b-md" />
              </div>

            </div>

            {/* Centered CTA Button */}
            <div className="mt-12">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="bg-[#00e1b2] hover:bg-[#00c59a] text-[#041c2c] font-bold text-[16px] px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg inline-flex items-center gap-2"
              >
                Get a Demo
                <ArrowRight weight="bold" size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* Testimonials Section (Full-Bleed Dark Teal with Rounded Top) */}
        <section className="w-full bg-[#023B35] rounded-t-[40px] pt-24 pb-44 px-6 md:px-12 -mt-10 relative z-10">
          <div className="max-w-[1280px] mx-auto text-center">
            
            {/* Heading */}
            <h2 className="text-[32px] md:text-[44px] font-serif text-white max-w-[800px] mx-auto leading-tight mb-16">
              Clinicians love working with MediTrack. <br className="hidden sm:inline" /> See why they rate us a 9.5 out of 10.
            </h2>

            {/* Testimonials Cards Grid (Overflow-X Scroll) */}
            <div className="flex gap-6 overflow-x-auto pb-10 justify-start scrollbar-none snap-x snap-mandatory">
              
              {/* Card 1 */}
              <div className="bg-[#032e29] border border-white/5 rounded-2xl p-8 min-w-[290px] max-w-[320px] shrink-0 text-left snap-start flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.15)] relative">
                <div>
                  <div className="relative w-14 h-14 mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=120" 
                      alt="Dr. Rajesh Varma" 
                      className="w-full h-full rounded-full object-cover border border-[#00e1b2]/20"
                    />
                    <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#00e1b2] flex items-center justify-center text-[#023B35] text-xs font-bold font-serif">“</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white">Dr. Rajesh Varma</h4>
                  <span className="text-[12px] text-emerald-400 font-semibold uppercase tracking-wider block mt-0.5 mb-4">District CMO</span>
                  <p className="text-[13px] text-white/85 leading-relaxed font-light">
                    "I love that model. I used to have to call all around, and I absolutely love that model that you could save me the time and headache of doing that."
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#032e29] border border-white/5 rounded-2xl p-8 min-w-[290px] max-w-[320px] shrink-0 text-left snap-start flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.15)] relative">
                <div>
                  <div className="relative w-14 h-14 mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120" 
                      alt="Dr. Ananya Nair" 
                      className="w-full h-full rounded-full object-cover border border-[#00e1b2]/20"
                    />
                    <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#00e1b2] flex items-center justify-center text-[#023B35] text-xs font-bold font-serif">“</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white">Dr. Ananya Nair</h4>
                  <span className="text-[12px] text-emerald-400 font-semibold uppercase tracking-wider block mt-0.5 mb-4">Medical Officer, CHC-1</span>
                  <p className="text-[13px] text-white/85 leading-relaxed font-light">
                    "I am so happy with this tool. Ever since my district switched to it, everything has been extremely pleasant, helpful, and they listen to my concerns instead of just saying okay!"
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#032e29] border border-white/5 rounded-2xl p-8 min-w-[290px] max-w-[320px] shrink-0 text-left snap-start flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.15)] relative">
                <div>
                  <div className="relative w-14 h-14 mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120" 
                      alt="Amit Sharma" 
                      className="w-full h-full rounded-full object-cover border border-[#00e1b2]/20"
                    />
                    <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#00e1b2] flex items-center justify-center text-[#023B35] text-xs font-bold font-serif">“</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white">Amit Sharma</h4>
                  <span className="text-[12px] text-emerald-400 font-semibold uppercase tracking-wider block mt-0.5 mb-4">Store Pharmacist, PHC-3</span>
                  <p className="text-[13px] text-white/85 leading-relaxed font-light">
                    "I just want to thank you for the great job you did during our transition to real-time inventory tracking. You unraveled all the confusion and the new app is wonderful."
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#032e29] border border-white/5 rounded-2xl p-8 min-w-[290px] max-w-[320px] shrink-0 text-left snap-start flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.15)] relative">
                <div>
                  <div className="relative w-14 h-14 mb-6">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" 
                      alt="Sunita Rao" 
                      className="w-full h-full rounded-full object-cover border border-[#00e1b2]/20"
                    />
                    <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#00e1b2] flex items-center justify-center text-[#023B35] text-xs font-bold font-serif">“</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-white">Sunita Rao</h4>
                  <span className="text-[12px] text-emerald-400 font-semibold uppercase tracking-wider block mt-0.5 mb-4">Front Desk Administrator</span>
                  <p className="text-[13px] text-white/85 leading-relaxed font-light">
                    "I think more health centers should be trained like this. You don't usually get that kind of direct operational dashboard. It is great to see compassion and technology meet."
                  </p>
                </div>
              </div>

            </div>

            {/* Indicator Dots */}
            <div className="flex gap-2 justify-center mt-6 select-none opacity-60">
              <span className="w-1.5 h-1.5 bg-[#00e1b2] rounded-full" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            </div>

          </div>
        </section>

        {/* Footer (Full Bleed) */}
        <footer className="w-full pt-20 pb-10 bg-white border-t border-gray-100 mt-20">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-left">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <Heartbeat weight="fill" className="text-[#041c2c] text-3xl" />
                <span className="text-[#041c2c] font-bold text-xl tracking-tight">MediTrack</span>
              </div>
              <p className="text-sm text-gray-500 max-w-[320px] leading-relaxed">
                Let's bring intelligent healthcare operations online. Connecting district command, medical officers, and pharmacists for seamless public care.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">For Medical Officers</a></li>
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">For CMOs</a></li>
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">For Pharmacists</a></li>
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">For Patients</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500 font-medium">
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#041c2c] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© 2026 MediTrack Operations. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gray-600 transition-colors">Terms of Use</a>
              <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
