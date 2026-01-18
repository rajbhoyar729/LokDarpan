import type { Config } from "tailwindcss";

export default {
    content: ["./app/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', '"Outfit"', "sans-serif"],
                display: ['"Space Grotesk"', "sans-serif"],
            },
            colors: {
                // Premium Minimalist Palette
                // Backgrounds: Deep, rich blacks and grays, not just flat black
                dark: {
                    50: '#FAFAFA',
                    100: '#F4F4F5',
                    200: '#E4E4E7',
                    300: '#D4D4D8',
                    400: '#A1A1AA',
                    500: '#71717A',
                    600: '#52525B',
                    700: '#3F3F46',
                    800: '#27272A',
                    900: '#18181B',
                    950: '#09090B', // Linear-style almost black
                    1000: '#000000',
                },
                // Accent: Sophisticated Violet/Blue (Ray of light)
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6', // Standard Blue
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                    950: '#172554',
                    glow: '#60a5fa', // Soft blue glow
                },
                // Secondary Accent: Muted Gold/Amber for status
                accent: {
                    500: '#F59E0B',
                    glow: '#FCD34D',
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                // Subtle top-down spotlight
                'spotlight': 'radial-gradient(circle at top center, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
                'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                'border-gradient': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            },
            boxShadow: {
                // Subtle, premium shadows
                'minimal': '0 0 0 1px rgba(255,255,255,0.08), 0 2px 8px rgba(0,0,0,0.4)',
                'minimal-hover': '0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.6)',
                'glow-subtle': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
                'glow-white': '0 0 20px rgba(255, 255, 255, 0.3)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            },
        },
    },
    plugins: [],
} satisfies Config;
