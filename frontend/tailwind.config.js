/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF6EB', // Warm cream paper background
        card: '#FFFFFF', // Clean white card background
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          800: '#1e40af',
          900: '#1e3a8a', // Deep royal blue for high-contrast outlines/headings
        },
        accent: {
          yellow: '#FACC15', // Vibrant sunflower yellow for buttons/highlights
          yellowLight: '#FEF08A', // Soft pastel yellow for blocks
          blueLight: '#BFDBFE', // Soft sky blue for events
          greenLight: '#BBF7D0', // Soft mint green for attendance safe zones
          redLight: '#FECACA', // Soft red for warning attendance zones
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'], // Geometric aesthetic UI sans
        serif: ['Playfair Display', 'serif'], // Editorial serif for headings
        mono: ['Courier Prime', 'monospace'],
      },
      boxShadow: {
        // Retro 3D hard shadows (no blur) instead of standard gradient glows
        'retro-sm': '2px 2px 0px 0px #1E3A8A',
        'retro': '4px 4px 0px 0px #1E3A8A',
        'retro-lg': '6px 6px 0px 0px #1E3A8A',
        'retro-xl': '8px 8px 0px 0px #1E3A8A',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
