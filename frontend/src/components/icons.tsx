// Line icons from the mockups (frontend/images). They inherit color from the text.
type P = { size?: number };

export const MenuIcon = ({ size = 34 }: P) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 60 48" aria-hidden="true">
    <path d="M0 5h60M0 24h45M0 43h27" stroke="currentColor" strokeWidth="6" />
  </svg>
);

export const CloseIcon = ({ size = 38 }: P) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <path d="M3 3l34 34M37 3L3 37" stroke="currentColor" strokeWidth="2.6" />
  </svg>
);

export const CartIcon = ({ size = 36 }: P) => (
  <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true" fill="currentColor">
    <path d="M1 4.5h5.2l4.4 17.2h19l4.3-12.3H11.3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinejoin="round" />
    <path d="M9.5 9.4h25.2l-4.3 12.3H12.7z" />
    <circle cx="14" cy="29.5" r="3" /><circle cx="27" cy="29.5" r="3" />
  </svg>
);

export const UserIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
    <circle cx="12" cy="8" r="4" /><path d="M4 21c1.2-4.2 4.3-6 8-6s6.8 1.8 8 6" strokeLinecap="round" />
  </svg>
);

export const PictureIcon = () => (
  <svg viewBox="0 0 96 96" aria-hidden="true">
    <circle cx="72" cy="24" r="8" fill="currentColor" />
    <path d="M10 60c10-12 18-20 26-20 12 0 12 28 26 28 6 0 10-6 14-10l10 10v-16l-10-8c-6 4-10 10-14 10-8 0-10-26-26-26-10 0-18 8-26 16z" fill="currentColor" />
  </svg>
);

