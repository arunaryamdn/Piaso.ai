import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import logo from '../assets/logo.png';
import landingImg from '../assets/Paiso_Landing_Page.png';

function isAuthenticated() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return true;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now;
    } catch {
        return false;
    }
}

// SVG icons for features
const FeatureIcons = [
    // Analytics
    <svg key="ai" width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#53D22C" opacity="0.15" /><path d="M12 7v5l4 2" stroke="#53D22C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    // Market
    <svg key="market" width="36" height="36" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="4" height="8" rx="2" fill="#53D22C" opacity="0.15" /><rect x="9" y="7" width="4" height="12" rx="2" fill="#53D22C" opacity="0.25" /><rect x="15" y="4" width="4" height="15" rx="2" fill="#53D22C" opacity="0.35" /></svg>,
    // Recommendations
    <svg key="rec" width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#53D22C" opacity="0.15" /><path d="M9 12l2 2 4-4" stroke="#53D22C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    // Security
    <svg key="sec" width="36" height="36" fill="none" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="10" rx="5" fill="#53D22C" opacity="0.15" /><path d="M12 15v-2" stroke="#53D22C" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="11" r="1" fill="#53D22C" /></svg>,
];

const features = [
    {
        title: 'ai-powered portfolio analysis',
        desc: 'Get actionable insights and analytics on your investments using advanced AI algorithms.'
    },
    {
        title: 'real-time market insights',
        desc: 'Stay ahead with live news, stock prices, and market trends tailored to your portfolio.'
    },
    {
        title: 'personalized recommendations',
        desc: 'Receive buy/sell/hold suggestions and diversification tips based on your unique profile.'
    },
    {
        title: 'secure & private',
        desc: 'Your data is encrypted and never shared. You are always in control of your information.'
    }
];

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 * i, duration: 0.7, ease: 'easeOut' },
    }),
};
const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};
const zoomIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};
const floatY = {
    animate: {
        y: [0, -12, 0],
        transition: { duration: 3, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut', type: 'tween' },
    },
};
const iconPulse = {
    animate: {
        scale: [1, 1.08, 1],
        y: [0, -6, 0],
        transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut', type: 'tween' },
    },
};

// Helper for staggered text animation
type StaggeredTextProps = { text: string; className?: string };
const StaggeredText: React.FC<StaggeredTextProps> = ({ text, className }) => (
    <span className={className} style={{ display: 'inline-block' }}>
        {Array.from(text).map((char, i) => (
            <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5, ease: 'easeOut' }}
                style={{ display: 'inline-block' }}
            >
                {char === ' ' ? '\u00A0' : char}
            </motion.span>
        ))}
    </span>
);

// Animated gradient background
const AnimatedGradient = () => (
    <motion.div
        className="fixed inset-0 -z-10 bg-gradient-to-tr from-[#162013] via-[#1F2C1A] to-[#53D22C]/30 opacity-90"
        style={{ backgroundSize: '200% 200%' }}
        animate={{
            backgroundPosition: [
                '0% 50%', '100% 50%', '100% 100%', '0% 50%'
            ]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
    />
);

// Parallax tilt for feature cards
function useParallaxTilt(ref: React.RefObject<HTMLDivElement | null>) {
    const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        setTilt({ x, y });
    };
    const handleMouseLeave = () => setTilt({ x: 0, y: 0 });
    return { tilt, handleMouseMove, handleMouseLeave };
}

// Ripple effect for button
type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    className?: string;
};
const RippleButton: React.FC<RippleButtonProps> = ({ children, className = '', ...props }) => {
    const [ripple, setRipple] = useState<{ x: number; y: number; size: number } | null>(null);
    const btnRef = useRef<HTMLButtonElement>(null);
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (!btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        setRipple({ x, y, size });
        setTimeout(() => setRipple(null), 500);
        if (props.onClick) props.onClick(e);
    };
    return (
        <button ref={btnRef} className={className + ' relative overflow-hidden'} {...props} onClick={handleClick}>
            {ripple && (
                <span
                    className="absolute rounded-full bg-[#53D22C]/40 animate-ripple"
                    style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
                />
            )}
            {children}
            <style>{`
                .animate-ripple {
                    animation: ripple 0.5s linear;
                }
                @keyframes ripple {
                    from { transform: scale(0); opacity: 0.7; }
                    to { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </button>
    );
};

// Placeholder testimonial section
const TestimonialSection = () => (
    <motion.section
        className="py-16 px-4 flex flex-col items-center bg-transparent"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
    >
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">trusted by investors</h2>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl justify-center">
            <motion.div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 flex-1 min-w-[250px]" variants={fadeUp} custom={1} initial={{ x: -60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }}>
                <p className="text-lg text-white mb-4">“paiso.ai helped me understand my portfolio risks and optimize my returns. The AI insights are a game changer!”</p>
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#53D22C] flex items-center justify-center text-white font-bold">A</span>
                    <span className="text-white font-semibold">Amit S.</span>
                </div>
            </motion.div>
            <motion.div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 flex-1 min-w-[250px]" variants={fadeUp} custom={2} initial={{ x: 60, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <p className="text-lg text-white mb-4">“The real-time news and recommendations are spot on. I feel more confident in my investments.”</p>
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#53D22C] flex items-center justify-center text-white font-bold">R</span>
                    <span className="text-white font-semibold">Riya M.</span>
                </div>
            </motion.div>
        </div>
    </motion.section>
);

// Placeholder footer
const Footer = () => (
    <motion.footer
        className="w-full py-8 px-4 bg-[#101c13] border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[#A2C398] text-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
    >
        <div className="flex items-center gap-2">
            <img src={logo} alt="paiso.ai logo" className="h-8 w-8 rounded-full bg-white p-1 border-2 border-[#53D22C]" />
            <span className="font-bold text-white">paiso.ai</span>
        </div>
        <div className="flex gap-6">
            <motion.a href="#features" className="hover:text-[#53D22C] transition" whileHover={{ scale: 1.15, color: '#53D22C' }}>Features</motion.a>
            <motion.a href="#testimonials" className="hover:text-[#53D22C] transition" whileHover={{ scale: 1.15, color: '#53D22C' }}>Testimonials</motion.a>
            <motion.a href="mailto:hello@paiso.ai" className="hover:text-[#53D22C] transition" whileHover={{ scale: 1.15, color: '#53D22C' }}>Contact</motion.a>
            <motion.a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#53D22C] transition" whileHover={{ scale: 1.15, color: '#53D22C' }}>Twitter</motion.a>
        </div>
        <div className="text-xs text-[#7ecbff]">© {new Date().getFullYear()} paiso.ai. All rights reserved.</div>
    </motion.footer>
);

const LandingPage: React.FC = () => {
    // For parallax tilt on feature cards
    const cardRef0 = useRef<HTMLDivElement>(null);
    const cardRef1 = useRef<HTMLDivElement>(null);
    const cardRef2 = useRef<HTMLDivElement>(null);
    const cardRef3 = useRef<HTMLDivElement>(null);
    const tilt0 = useParallaxTilt(cardRef0);
    const tilt1 = useParallaxTilt(cardRef1);
    const tilt2 = useParallaxTilt(cardRef2);
    const tilt3 = useParallaxTilt(cardRef3);
    const cardRefs = [cardRef0, cardRef1, cardRef2, cardRef3];
    const tilts = [tilt0, tilt1, tilt2, tilt3];
    // For hero logo hover
    const logoControls = useAnimation();

    return (
        <div className="min-h-screen w-full font-sans relative overflow-x-hidden">
            {/* Animated gradient background */}
            <AnimatedGradient />
            {/* Glassmorphism container */}
            <div className="flex flex-col min-h-screen">
                {/* Top bar */}
                <motion.div
                    className="w-full flex items-center justify-between px-8 py-6 bg-white/10 backdrop-blur-lg shadow-lg"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                >
                    {/* Branding on the left */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src={logo} alt="paiso.ai logo" className="h-10 w-10 rounded-full bg-white p-1 border-2 border-[#53D22C] shadow" />
                        <span className="font-extrabold text-2xl text-white lowercase tracking-tight group-hover:text-[#53D22C] transition">paiso.ai</span>
                    </Link>
                    {/* Auth buttons on the right */}
                    <div className="flex gap-6">
                        <Link to="/login">
                            <button className="bg-transparent hover:bg-[#53D22C]/80 text-[#53D22C] hover:text-[#162013] font-bold px-8 py-3 rounded-xl text-lg shadow transition-colors border-2 border-[#53D22C] backdrop-blur-lg">login</button>
                        </Link>
                        <Link to="/signup">
                            <button className="bg-[#53D22C]/90 hover:bg-[#70e048] text-[#162013] font-bold px-8 py-3 rounded-xl text-lg shadow transition-colors border-2 border-[#53D22C] backdrop-blur-lg">sign up</button>
                        </Link>
                    </div>
                </motion.div>
                {/* Hero Section */}
                <motion.section
                    className="flex flex-col items-center justify-center py-24 px-4 bg-transparent"
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                >
                    <motion.img
                        src={logo}
                        alt="paiso.ai logo"
                        className="h-28 w-28 rounded-full bg-white p-2 mb-8 border-4 border-[#53D22C] shadow-2xl cursor-pointer"
                        variants={fadeUp}
                        custom={1}
                        whileHover={{ scale: 1.08, rotate: [0, 6, -6, 0] }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    />
                    <motion.h1 className="text-6xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg lowercase" variants={fadeUp} custom={2}>
                        <StaggeredText text="paiso.ai" />
                    </motion.h1>
                    <motion.p className="text-2xl md:text-3xl text-[#A2C398] mb-10 text-center max-w-2xl font-medium" variants={fadeUp} custom={3}>
                        smarter investing starts here. analyze, optimize, and grow your wealth with ai-driven insights.
                    </motion.p>
                    <motion.div variants={fadeUp} custom={4}>
                        <Link to="/login">
                            <RippleButton className="bg-[#53D22C]/90 hover:bg-[#70e048] text-[#162013] font-bold px-12 py-5 rounded-full text-2xl shadow-2xl transition-all border-2 border-[#53D22C] backdrop-blur-lg hover:scale-105 active:scale-95 duration-150">
                                get started
                            </RippleButton>
                        </Link>
                    </motion.div>
                </motion.section>
                {/* Features Section */}
                <motion.section
                    id="features"
                    className="py-16 px-4 bg-transparent"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                >
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                ref={cardRefs[i]}
                                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center transition-transform hover:scale-105 duration-150 cursor-pointer"
                                variants={fadeUp}
                                custom={i + 1}
                                whileHover={{ scale: 1.07 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    transform: `rotateY(${tilts[i].tilt.x}deg) rotateX(${-tilts[i].tilt.y}deg)`
                                }}
                                onMouseMove={tilts[i].handleMouseMove}
                                onMouseLeave={tilts[i].handleMouseLeave}
                            >
                                <motion.div className="mb-4" variants={iconPulse} animate="animate">
                                    {FeatureIcons[i]}
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2 text-[#53D22C] lowercase">{f.title}</h3>
                                <p className="text-gray-200 text-base">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
                {/* Product Screenshot Section */}
                <motion.section
                    className="py-20 px-4 flex flex-col items-center bg-transparent"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={zoomIn}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center drop-shadow-lg">see paiso.ai in action</h2>
                    <motion.img
                        src={landingImg}
                        alt="paiso.ai screenshot"
                        className="rounded-3xl shadow-2xl w-full max-w-4xl border-4 border-[#2E4328]/40 backdrop-blur-lg"
                        variants={floatY}
                        animate="animate"
                    />
                </motion.section>
                {/* Testimonial Section */}
                <TestimonialSection />
                {/* Call to Action */}
                <motion.section
                    className="py-12 flex flex-col items-center bg-transparent"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={fadeUp}
                >
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white text-center">ready to take control of your financial future?</h3>
                    <Link to="/login">
                        <RippleButton className="bg-[#53D22C]/90 hover:bg-[#70e048] text-[#162013] font-bold px-10 py-4 rounded-full text-xl shadow-xl transition-all border-2 border-[#53D22C] backdrop-blur-lg hover:scale-105 active:scale-95 duration-150">
                            get started
                        </RippleButton>
                    </Link>
                </motion.section>
                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
};

export default LandingPage; 