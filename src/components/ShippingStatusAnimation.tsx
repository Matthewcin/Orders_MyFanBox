import React from 'react';

export type ClientTheme = 'light' | 'dark' | 'myfanbox';

interface ShippingStatusAnimationProps {
  shippingStatus: string;
  paymentStatus?: string;
  active?: boolean;
  clientTheme: ClientTheme;
  carrier?: string;
}

function resolveAnimationStep(shippingStatus: string): 0 | 1 | 2 {
  const normalized = String(shippingStatus || '').trim().toLowerCase();
  if (normalized.includes('entregado')) return 2;
  if (normalized.includes('enviado')) return 1;
  return 0;
}

export default function ShippingStatusAnimation({
  shippingStatus,
  paymentStatus,
  active = true,
  clientTheme,
  carrier
}: ShippingStatusAnimationProps) {
  const step = resolveAnimationStep(shippingStatus);

  const title = !active
    ? `Pedido ${String(paymentStatus || 'inactivo').toLowerCase()}`
    : step === 2
    ? 'Tu pedido ha sido entregado'
    : step === 1
    ? 'Tu pedido está en camino'
    : 'Gracias por tu compra';

  const subtitle = !active
    ? 'Este pedido no se encuentra activo para envío.'
    : step === 2
    ? '¡Disfruta tus prendas de MyFanBox!'
    : step === 1
    ? `Despachado con ${carrier || 'transportadora asignada'} · Envío GRATIS`
    : shippingStatus === 'Por enviar'
    ? 'Tu pedido ya está empacado y listo para despachar'
    : 'Estamos preparando y empacando tus prendas en taller';

  return (
    <div
      data-theme={clientTheme}
      style={{
        backgroundColor: 'var(--mfb-surface)',
        border: '1px solid var(--mfb-border)',
        boxShadow: 'var(--mfb-card-shadow)'
      }}
      className={`mfb-ship-card rounded-2xl px-5 py-6 sm:px-8 sm:py-7 flex flex-col items-center justify-center text-center transition-all duration-300 ${
        active ? '' : 'mfb-ship-paused opacity-70'
      }`}
    >
      <style>{`
        .mfb-ship-card .mfb-ship-svg {
          width: 100%;
          height: auto;
          display: block;
          overflow: visible;
        }
        .mfb-ship-card.mfb-ship-paused .mfb-anim {
          animation-play-state: paused !important;
        }
        @keyframes mfbBeltRoll {
          0% { transform: translateX(0px); }
          100% { transform: translateX(28px); }
        }
        @keyframes mfbDrumSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mfbParcelGlide {
          0% { transform: translateX(24px); opacity: 0; }
          5% { opacity: 1; }
          93% { opacity: 1; }
          100% { transform: translateX(336px); opacity: 0; }
        }
        @keyframes mfbClawArmCycle {
          0%, 8% { transform: translateY(0px); }
          26% { transform: translateY(25px); }
          36% { transform: translateY(25px); }
          62%, 100% { transform: translateY(0px); }
        }
        @keyframes mfbJawLeftOpen {
          0%, 24% { transform: rotate(0deg); }
          31%, 48% { transform: rotate(22deg); }
          64%, 100% { transform: rotate(0deg); }
        }
        @keyframes mfbJawRightOpen {
          0%, 24% { transform: rotate(0deg); }
          31%, 48% { transform: rotate(-22deg); }
          64%, 100% { transform: rotate(0deg); }
        }
        @keyframes mfbGarmentDropCycle {
          0%, 6% { transform: translateY(0px) scale(0.86); opacity: 0; }
          13% { transform: translateY(0px) scale(1); opacity: 1; }
          26% { transform: translateY(25px) scale(1); opacity: 1; }
          37% { transform: translateY(44px) scale(0.92); opacity: 0.95; }
          43% { transform: translateY(50px) scale(0.8); opacity: 0; }
          100% { transform: translateY(0px) scale(0.8); opacity: 0; }
        }
        @keyframes mfbBoxHoodiePeek {
          0%, 19% { opacity: 0; transform: translateY(-7px) scale(0.85); }
          23% { opacity: 1; transform: translateY(0px) scale(1); }
          60% { opacity: 1; transform: translateY(0px) scale(1); }
          64%, 100% { opacity: 0; transform: translateY(3px) scale(0.95); }
        }
        @keyframes mfbBoxTeePeek {
          0%, 40% { opacity: 0; transform: translateY(-7px) scale(0.85); }
          44% { opacity: 1; transform: translateY(0px) scale(1); }
          60% { opacity: 1; transform: translateY(0px) scale(1); }
          64%, 100% { opacity: 0; transform: translateY(3px) scale(0.95); }
        }
        @keyframes mfbLidPressArmCycle {
          0%, 12% { transform: translateY(0px); }
          29% { transform: translateY(24px); }
          36% { transform: translateY(24px); }
          60%, 100% { transform: translateY(0px); }
        }
        @keyframes mfbPressHeldLid {
          0%, 6% { opacity: 0; }
          12%, 28% { opacity: 1; }
          31%, 100% { opacity: 0; }
        }
        @keyframes mfbParcelLidSnap {
          0%, 60% { opacity: 0; transform: translateY(-10px); }
          63% { opacity: 1; transform: translateY(1px); }
          67%, 100% { opacity: 1; transform: translateY(0px); }
        }
        @keyframes mfbTapeHeadCycle {
          0%, 16% { transform: translateY(0px); }
          30% { transform: translateY(14px); }
          38% { transform: translateY(14px); }
          58%, 100% { transform: translateY(0px); }
        }
        @keyframes mfbParcelTapeSeal {
          0%, 79% { opacity: 0; transform: scaleY(0); }
          84% { opacity: 1; transform: scaleY(1.06); }
          88%, 100% { opacity: 1; transform: scaleY(1); }
        }
        @keyframes mfbTruckSuspension {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-2.2px) rotate(-0.32deg); }
          50% { transform: translateY(0.35px) rotate(0.18deg); }
          75% { transform: translateY(-1.5px) rotate(-0.14deg); }
        }
        @keyframes mfbWheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes mfbWindStreak {
          0% { transform: translateX(18px); opacity: 0; }
          22% { opacity: 0.9; }
          78% { opacity: 0.55; }
          100% { transform: translateX(-34px); opacity: 0; }
        }
        @keyframes mfbDustRoll {
          0% { transform: translate(0px, 0px) scale(0.55); opacity: 0; }
          24% { opacity: 0.85; }
          75% { opacity: 0.45; }
          100% { transform: translate(-36px, -4px) scale(1.22); opacity: 0; }
        }
        @keyframes mfbPackageBounce {
          0% { transform: translateY(-18px) scale(0.95, 1.05); opacity: 0.25; }
          15% { transform: translateY(0px) scale(1.06, 0.93); opacity: 1; }
          25% { transform: translateY(-7px) scale(0.97, 1.03); }
          34% { transform: translateY(0px) scale(1.02, 0.98); }
          42%, 100% { transform: translateY(0px) scale(1, 1); opacity: 1; }
        }
        @keyframes mfbTagSwing {
          0%, 100% { transform: rotate(0deg); }
          22% { transform: rotate(10deg); }
          38% { transform: rotate(-7deg); }
          52% { transform: rotate(3deg); }
          68% { transform: rotate(0deg); }
        }
        @keyframes mfbSparkleTwinkle {
          0%, 12% { transform: scale(0.35) rotate(0deg); opacity: 0; }
          25% { transform: scale(1.1) rotate(12deg); opacity: 1; }
          44% { transform: scale(0.9) rotate(22deg); opacity: 0.7; }
          62%, 100% { transform: scale(0.35) rotate(30deg); opacity: 0; }
        }
        @keyframes mfbBellPulse {
          0%, 26% { transform: scale(0.5); opacity: 0; }
          34% { transform: scale(0.95); opacity: 0.95; }
          64% { transform: scale(2.45); opacity: 0; }
          100% { transform: scale(2.45); opacity: 0; }
        }
        @keyframes mfbSconceGlowPulse {
          0%, 100% { opacity: 0.42; transform: scale(0.96); }
          50% { opacity: 0.95; transform: scale(1.06); }
        }
        @keyframes mfbTreeSway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(1.6deg); }
        }
        .mfb-belt-rollers { animation: mfbBeltRoll 0.43s linear infinite; }
        .mfb-drum-rotor { animation: mfbDrumSpin 0.9s linear infinite; }
        .mfb-parcel-unit { animation: mfbParcelGlide 4.8s linear infinite; }
        .mfb-parcel-hoodie-peek { animation: mfbBoxHoodiePeek 4.8s ease-out infinite; }
        .mfb-parcel-tee-peek { animation: mfbBoxTeePeek 4.8s ease-out infinite; }
        .mfb-parcel-lid { animation: mfbParcelLidSnap 4.8s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        .mfb-parcel-tape { transform-origin: 0px 0px; animation: mfbParcelTapeSeal 4.8s ease-out infinite; }
        .mfb-parcel-1, .mfb-parcel-1 .mfb-parcel-hoodie-peek, .mfb-parcel-1 .mfb-parcel-tee-peek, .mfb-parcel-1 .mfb-parcel-lid, .mfb-parcel-1 .mfb-parcel-tape { animation-delay: 0s; }
        .mfb-parcel-2, .mfb-parcel-2 .mfb-parcel-hoodie-peek, .mfb-parcel-2 .mfb-parcel-tee-peek, .mfb-parcel-2 .mfb-parcel-lid, .mfb-parcel-2 .mfb-parcel-tape { animation-delay: -1.6s; }
        .mfb-parcel-3, .mfb-parcel-3 .mfb-parcel-hoodie-peek, .mfb-parcel-3 .mfb-parcel-tee-peek, .mfb-parcel-3 .mfb-parcel-lid, .mfb-parcel-3 .mfb-parcel-tape { animation-delay: -3.2s; }
        .mfb-claw-1-arm, .mfb-claw-1-jaw-l, .mfb-claw-1-jaw-r, .mfb-claw-1-garment {
          animation-duration: 1.6s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-delay: -1.08s;
        }
        .mfb-claw-2-arm, .mfb-claw-2-jaw-l, .mfb-claw-2-jaw-r, .mfb-claw-2-garment {
          animation-duration: 1.6s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
          animation-delay: -0.08s;
        }
        .mfb-claw-1-arm, .mfb-claw-2-arm { animation-name: mfbClawArmCycle; }
        .mfb-claw-1-jaw-l, .mfb-claw-2-jaw-l { animation-name: mfbJawLeftOpen; transform-origin: -4px 25px; }
        .mfb-claw-1-jaw-r, .mfb-claw-2-jaw-r { animation-name: mfbJawRightOpen; transform-origin: 4px 25px; }
        .mfb-claw-1-garment, .mfb-claw-2-garment { animation-name: mfbGarmentDropCycle; }
        .mfb-lid-press-arm { animation: mfbLidPressArmCycle 1.6s ease-in-out infinite -0.68s; }
        .mfb-press-lid-ghost { animation: mfbPressHeldLid 1.6s ease-in-out infinite -0.68s; }
        .mfb-tape-sealer-head { animation: mfbTapeHeadCycle 1.6s ease-in-out infinite -1.38s; }
        .mfb-truck-body { transform-origin: 185px 118px; animation: mfbTruckSuspension 0.56s ease-in-out infinite; }
        .mfb-wheel-spin { animation: mfbWheelSpin 0.66s linear infinite; }
        .mfb-wind-line-1 { animation: mfbWindStreak 0.95s linear infinite; }
        .mfb-wind-line-2 { animation: mfbWindStreak 1.15s linear infinite -0.45s; }
        .mfb-wind-line-3 { animation: mfbWindStreak 0.85s linear infinite -0.7s; }
        .mfb-dust-puff-1 { animation: mfbDustRoll 0.95s ease-out infinite; }
        .mfb-dust-puff-2 { animation: mfbDustRoll 0.95s ease-out infinite -0.48s; }
        .mfb-dust-puff-3 { animation: mfbDustRoll 1.05s ease-out infinite -0.25s; }
        .mfb-dust-puff-4 { animation: mfbDustRoll 1.05s ease-out infinite -0.75s; }
        .mfb-delivered-package { transform-origin: 180px 130px; animation: mfbPackageBounce 3.2s cubic-bezier(0.22, 1, 0.36, 1) infinite; }
        .mfb-package-tag { transform-origin: 190px 101px; animation: mfbTagSwing 3.2s ease-in-out infinite; }
        .mfb-sparkle-a { transform-origin: 147px 88px; animation: mfbSparkleTwinkle 3.2s ease-out infinite; }
        .mfb-sparkle-b { transform-origin: 213px 86px; animation: mfbSparkleTwinkle 3.2s ease-out infinite -0.18s; }
        .mfb-sparkle-c { transform-origin: 180px 76px; animation: mfbSparkleTwinkle 3.2s ease-out infinite -0.1s; }
        .mfb-doorbell-ripple { transform-origin: 224px 62px; animation: mfbBellPulse 3.2s ease-out infinite; }
        .mfb-sconce-glow-left { transform-origin: 114px 48px; animation: mfbSconceGlowPulse 2.8s ease-in-out infinite; }
        .mfb-sconce-glow-right { transform-origin: 246px 48px; animation: mfbSconceGlowPulse 2.8s ease-in-out infinite -0.45s; }
        .mfb-tree-left { transform-origin: 100px 118px; animation: mfbTreeSway 4.2s ease-in-out infinite; }
        .mfb-tree-right { transform-origin: 260px 118px; animation: mfbTreeSway 4.2s ease-in-out infinite -1.8s; }
      `}</style>

      <div className="w-full max-w-[380px] mx-auto mb-3">
        {step === 0 && (
          <svg
            className="mfb-ship-svg"
            viewBox="0 0 360 156"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="mfbBeltRollerClip">
                <rect x="46" y="114" width="268" height="16" rx="8" />
              </clipPath>
              <clipPath id="mfbConveyorBoxClip">
                <rect x="34" y="64" width="292" height="52" />
              </clipPath>
            </defs>

            <line x1="24" y1="144" x2="336" y2="144" stroke="var(--mfb-ground-muted)" strokeWidth="2" strokeLinecap="round" />
            <line x1="54" y1="8" x2="308" y2="8" stroke="var(--mfb-ground-muted)" strokeWidth="2" strokeLinecap="round" />

            <g transform="translate(89, 8)">
              <g className="mfb-anim mfb-claw-1-arm">
                <rect x="-5" y="-3" width="10" height="6" rx="2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <line x1="0" y1="3" x2="0" y2="21" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" />
                <rect x="-7" y="21" width="14" height="5" rx="2.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <g className="mfb-anim mfb-claw-1-jaw-l">
                  <path d="M-4 25 L-11 32 L-7 39" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g className="mfb-anim mfb-claw-1-jaw-r">
                  <path d="M4 25 L11 32 L7 39" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>

              <g className="mfb-anim mfb-claw-1-garment">
                <g transform="translate(0, 44)">
                  <path d="M-6 -10 C-6 -17, 6 -17, 6 -10 Z" fill="var(--mfb-accent-deep)" stroke="var(--mfb-text)" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M-5.5 -10 L-13 -6 L-15.5 6.5 L-10.5 7.5 L-9 -0.5 L-9 11.5 L9 11.5 L9 -0.5 L10.5 7.5 L15.5 6.5 L13 -6 L5.5 -10 Q0 -6.5 -5.5 -10 Z" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
                  <path d="M-4 -10 Q0 -13.5 4 -10" stroke="var(--mfb-text)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  <line x1="-2.2" y1="-7.5" x2="-2.2" y2="-2.2" stroke="var(--mfb-text)" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="2.2" y1="-7.5" x2="2.2" y2="-2.2" stroke="var(--mfb-text)" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M-5.2 2.5 H5.2 L6.2 8.2 H-6.2 Z" fill="var(--mfb-accent-deep)" fillOpacity="0.35" stroke="var(--mfb-text)" strokeWidth="1.5" strokeLinejoin="round" />
                  <line x1="-14.2" y1="4.2" x2="-10.8" y2="5" stroke="var(--mfb-text)" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="14.2" y1="4.2" x2="10.8" y2="5" stroke="var(--mfb-text)" strokeWidth="1.4" strokeLinecap="round" />
                </g>
              </g>
            </g>

            <g transform="translate(154, 8)">
              <g className="mfb-anim mfb-claw-2-arm">
                <rect x="-5" y="-3" width="10" height="6" rx="2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <line x1="0" y1="3" x2="0" y2="21" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" />
                <rect x="-7" y="21" width="14" height="5" rx="2.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <g className="mfb-anim mfb-claw-2-jaw-l">
                  <path d="M-4 25 L-11 32 L-7 39" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <g className="mfb-anim mfb-claw-2-jaw-r">
                  <path d="M4 25 L11 32 L7 39" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>

              <g className="mfb-anim mfb-claw-2-garment">
                <g transform="translate(0, 44)">
                  <path d="M-5.5 -9.5 Q0 -5 5.5 -9.5 L4.5 -11 Q0 -8.5 -4.5 -11 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M-5.5 -9.5 L-14 -5.5 L-11.5 0.5 L-8.5 -0.8 L-8.5 10.5 L8.5 10.5 L8.5 -0.8 L11.5 0.5 L14 -5.5 L5.5 -9.5 Q0 -5.2 -5.5 -9.5 Z" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
                  <line x1="-8" y1="4.8" x2="8" y2="4.8" stroke="var(--mfb-text)" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M-4.5 -8.5 Q0 -4.8 4.5 -8.5" stroke="var(--mfb-surface)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <rect x="1.5" y="-2.2" width="4.2" height="4.2" rx="0.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.3" />
                </g>
              </g>
            </g>

            <g transform="translate(219, 8)">
              <rect x="-15" y="14" width="30" height="5" rx="1.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
              <rect x="-15" y="23" width="30" height="5" rx="1.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
              <g className="mfb-anim mfb-lid-press-arm">
                <rect x="-5" y="-3" width="10" height="6" rx="2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <line x1="0" y1="3" x2="0" y2="49" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" />
                <rect x="-10" y="49" width="20" height="4.5" rx="1.5" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <rect className="mfb-anim mfb-press-lid-ghost" x="-19" y="54" width="38" height="6.5" rx="1.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.9" />
              </g>
            </g>

            <g transform="translate(278, 8)">
              <g className="mfb-anim mfb-tape-sealer-head">
                <rect x="-5" y="-3" width="10" height="6" rx="2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <line x1="0" y1="3" x2="0" y2="54" stroke="var(--mfb-text)" strokeWidth="2" strokeLinecap="round" />
                <rect x="-8" y="54" width="16" height="9" rx="2.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <circle cx="0" cy="58.5" r="3" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.5" />
                <rect x="-2.5" y="63" width="5" height="5" rx="1" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.4" />
              </g>
            </g>

            <g clipPath="url(#mfbConveyorBoxClip)">
              {['mfb-parcel-1', 'mfb-parcel-2', 'mfb-parcel-3'].map((cls) => (
                <g key={cls} className={`mfb-anim mfb-parcel-unit ${cls}`}>
                  <g transform="translate(0, 84)">
                    <g className="mfb-anim mfb-parcel-hoodie-peek">
                      <path d="M-11 4 C-11 -4, -1 -4, -1 4 Z" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.7" strokeLinejoin="round" />
                      <path d="M-8 1 C-6 -2, -3 -2, -2 1" stroke="var(--mfb-text)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                    </g>
                    <g className="mfb-anim mfb-parcel-tee-peek">
                      <path d="M-1 4 C0 -3, 12 -3, 12 4 Z" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.7" strokeLinejoin="round" />
                      <path d="M3 0.5 Q6 3 9 0.5" stroke="var(--mfb-surface)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                    </g>
                    <rect x="-17" y="4" width="34" height="24" rx="2" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" strokeLinejoin="round" />
                    <line x1="-15.5" y1="8.5" x2="15.5" y2="8.5" stroke="var(--mfb-ground-muted)" strokeWidth="1.5" />
                    <rect x="-12" y="20" width="6.5" height="4" rx="1" fill="var(--mfb-accent-soft)" />
                    <g className="mfb-anim mfb-parcel-lid">
                      <rect x="-19.5" y="0" width="39" height="6.5" rx="1.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" strokeLinejoin="round" />
                    </g>
                    <g className="mfb-anim mfb-parcel-tape">
                      <rect x="-3" y="0" width="6" height="17" fill="var(--mfb-accent)" />
                      <path d="M-3 0 V17 H3 V0" stroke="var(--mfb-text)" strokeWidth="1.5" strokeLinejoin="round" />
                    </g>
                  </g>
                </g>
              ))}
            </g>

            <path d="M64 130 L58 144 H70 L74 130 Z" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            <path d="M286 130 L290 144 H302 L296 130 Z" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            <rect x="74" y="133" width="212" height="4" rx="2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.7" />
            <rect x="36" y="112" width="288" height="20" rx="10" fill="var(--mfb-belt-fill)" stroke="var(--mfb-text)" strokeWidth="2.2" strokeLinejoin="round" />

            <g clipPath="url(#mfbBeltRollerClip)">
              <g className="mfb-anim mfb-belt-rollers">
                {[48, 76, 104, 132, 160, 188, 216, 244, 272, 300, 328].map((cx) => (
                  <circle key={cx} cx={cx} cy="122" r="2.6" fill="var(--mfb-text)" />
                ))}
              </g>
            </g>

            <g transform="translate(46, 122)">
              <circle cx="0" cy="0" r="8.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" />
              <g className="mfb-anim mfb-drum-rotor">
                <circle cx="0" cy="0" r="2.5" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.4" />
                <line x1="0" y1="-6.2" x2="0" y2="-3.5" stroke="var(--mfb-text)" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="0" y1="3.5" x2="0" y2="6.2" stroke="var(--mfb-text)" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(314, 122)">
              <circle cx="0" cy="0" r="8.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" />
              <g className="mfb-anim mfb-drum-rotor">
                <circle cx="0" cy="0" r="2.5" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.4" />
                <line x1="0" y1="-6.2" x2="0" y2="-3.5" stroke="var(--mfb-text)" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="0" y1="3.5" x2="0" y2="6.2" stroke="var(--mfb-text)" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            </g>
          </svg>
        )}

        {step === 1 && (
          <svg
            className="mfb-ship-svg"
            viewBox="0 0 360 156"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <line className="mfb-anim mfb-wind-line-1" x1="22" y1="66" x2="52" y2="66" stroke="var(--mfb-text-muted)" strokeWidth="2" strokeLinecap="round" />
            <line className="mfb-anim mfb-wind-line-2" x1="32" y1="47" x2="54" y2="47" stroke="var(--mfb-accent)" strokeWidth="2" strokeLinecap="round" />
            <line className="mfb-anim mfb-wind-line-3" x1="26" y1="90" x2="48" y2="90" stroke="var(--mfb-text-muted)" strokeWidth="1.8" strokeLinecap="round" />

            <g className="mfb-anim mfb-dust-puff-1">
              <circle cx="116" cy="133" r="5" fill="var(--mfb-dust-fill)" />
              <circle cx="109" cy="134" r="3.4" fill="var(--mfb-dust-fill)" />
            </g>
            <g className="mfb-anim mfb-dust-puff-2">
              <circle cx="104" cy="133" r="3.8" fill="var(--mfb-dust-fill)" />
              <circle cx="97" cy="134" r="2.6" fill="var(--mfb-dust-fill)" />
            </g>
            <g className="mfb-anim mfb-dust-puff-3">
              <circle cx="240" cy="133" r="4.5" fill="var(--mfb-dust-fill)" />
              <circle cx="233" cy="134" r="3.2" fill="var(--mfb-dust-fill)" />
            </g>
            <g className="mfb-anim mfb-dust-puff-4">
              <circle cx="228" cy="134" r="3.4" fill="var(--mfb-dust-fill)" />
            </g>

            <g>
              <circle cx="122" cy="121" r="14" fill="var(--mfb-text)" opacity="0.22" />
              <circle cx="246" cy="121" r="14" fill="var(--mfb-text)" opacity="0.22" />
            </g>

            <g className="mfb-anim mfb-truck-body">
              <rect x="148" y="117" width="94" height="5.5" fill="var(--mfb-text)" />
              <path d="M72 30 H95 V119 H69 V33 A3 3 0 0 1 72 30 Z" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="2.1" strokeLinejoin="round" />
              <rect x="74.5" y="38" width="17.5" height="81" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.8" strokeLinejoin="round" />
              {[49, 60, 71, 82, 93, 104].map((y) => (
                <line key={y} x1="74.5" y1={y} x2="92" y2={y} stroke="var(--mfb-text)" strokeWidth="1.7" />
              ))}
              <line x1="79.5" y1="112" x2="87" y2="112" stroke="var(--mfb-text)" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M95 30 H209 A3 3 0 0 1 212 33 V119 H95 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2.1" strokeLinejoin="round" />
              <rect x="65" y="118" width="147" height="4.8" rx="1.6" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.9" />

              <text
                x="153"
                y="82"
                textAnchor="middle"
                fill="var(--mfb-text)"
                fontFamily="'Plus Jakarta Sans', 'Inter', sans-serif"
                fontSize="18"
                fontWeight="800"
                fontStyle="italic"
                letterSpacing="-0.025em"
              >
                ¡En Camino!
              </text>

              <rect x="212" y="47" width="7" height="75" fill="var(--mfb-text)" />
              <path d="M219 47 H248 C255 47 259 50 264 57 L274 72 L290 79 C295 81 297 86 297 92 V109 H299 C301 109 302 111 302 114 V118 C302 121 300 123 297 123 H219 V47 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2.1" strokeLinejoin="round" />
              <path d="M223 52 V108 C223 111 225 113 228 113 H245" stroke="var(--mfb-text)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M225 53 H247 C252 53 255 55 258 60 L269 76 H225 Z" fill="var(--mfb-accent)" fillOpacity="0.88" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
              <line x1="234" y1="70" x2="245" y2="58" stroke="var(--mfb-surface)" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
              <line x1="268" y1="70" x2="272" y2="70" stroke="var(--mfb-text)" strokeWidth="2" />
              <rect x="270" y="59" width="5.5" height="13" rx="2" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
              <path d="M272 72 L276 78" stroke="var(--mfb-text)" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="230" y1="87" x2="238" y2="87" stroke="var(--mfb-text)" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M297 91 H291 C289 91 288 92.5 288 94.5 V100.5 C288 102.5 289 104 291 104 H297 Z" fill="var(--mfb-accent-soft)" stroke="var(--mfb-text)" strokeWidth="1.8" strokeLinejoin="round" />
              <line x1="287" y1="111" x2="299" y2="111" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinecap="round" />
              <path d="M125 122 A19 19 0 0 1 163 122 Z" fill="var(--mfb-surface)" />
              <path d="M126 121 A18 18 0 0 1 162 121" stroke="var(--mfb-text)" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M249 122 A19 19 0 0 1 287 122 Z" fill="var(--mfb-surface)" />
              <path d="M250 121 A18 18 0 0 1 286 121" stroke="var(--mfb-text)" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>

            <g transform="translate(144, 121)">
              <circle cx="0" cy="0" r="13.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="3" />
              <g className="mfb-anim mfb-wheel-spin">
                <circle cx="0" cy="0" r="7.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="2.6" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.4" />
                <path d="M0 -7.8 L0 -5 M6.8 3.9 L4.4 2.5 M-6.8 3.9 L-4.4 2.5" stroke="var(--mfb-text)" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(268, 121)">
              <circle cx="0" cy="0" r="13.5" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="3" />
              <g className="mfb-anim mfb-wheel-spin">
                <circle cx="0" cy="0" r="7.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="2.6" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.4" />
                <path d="M0 -7.8 L0 -5 M6.8 3.9 L4.4 2.5 M-6.8 3.9 L-4.4 2.5" stroke="var(--mfb-text)" strokeWidth="1.8" strokeLinecap="round" />
              </g>
            </g>

            <line x1="26" y1="136" x2="334" y2="136" stroke="var(--mfb-text)" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}

        {step === 2 && (
          <svg
            className="mfb-ship-svg"
            viewBox="0 0 360 156"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="mfbSconceVioletGlow" cx="50%" cy="85%" r="65%">
                <stop offset="0%" stopColor="#C7BAFF" stopOpacity="0.72" />
                <stop offset="58%" stopColor="#C7BAFF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#C7BAFF" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g stroke="var(--mfb-ground-muted)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="118" y1="74" x2="134" y2="74" />
              <line x1="124" y1="80" x2="137" y2="80" />
              <line x1="224" y1="82" x2="240" y2="82" />
              <line x1="220" y1="88" x2="232" y2="88" />
            </g>

            <g>
              <path className="mfb-anim mfb-sconce-glow-left" d="M106 48 L94 21 H134 L122 48 Z" fill="url(#mfbSconceVioletGlow)" />
              <path d="M106 48 H122 A8 7 0 0 1 106 48 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            </g>

            <g>
              <path className="mfb-anim mfb-sconce-glow-right" d="M238 48 L226 21 H266 L254 48 Z" fill="url(#mfbSconceVioletGlow)" />
              <path d="M238 48 H254 A8 7 0 0 1 238 48 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            </g>

            <rect x="148" y="22" width="64" height="108" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="2.1" strokeLinejoin="round" />
            <rect x="143" y="17" width="74" height="5" rx="1.4" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            <rect x="154" y="28" width="52" height="102" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" strokeLinejoin="round" />
            <rect x="161" y="36" width="15" height="39" rx="1.2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.6" />
            <rect x="184" y="36" width="15" height="39" rx="1.2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.6" />
            <rect x="161" y="82" width="15" height="24" rx="1.2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.6" />
            <rect x="184" y="82" width="15" height="24" rx="1.2" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.6" />
            <rect x="198.5" y="75" width="4.2" height="13" rx="1.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.5" />
            <circle cx="200.6" cy="83" r="2.7" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.7" />

            <circle className="mfb-anim mfb-doorbell-ripple" cx="224" cy="62" r="7.5" stroke="var(--mfb-accent)" strokeWidth="2" fill="none" />
            <rect x="219" y="57" width="10" height="10" rx="2" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="1.8" />
            <circle cx="224" cy="62" r="1.8" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1" />

            <g>
              <g className="mfb-anim mfb-tree-left">
                <line x1="100" y1="106" x2="100" y2="119" stroke="var(--mfb-text)" strokeWidth="2" />
                <path d="M100 68 C92 82 88 95 89 102 C90 109 95 111 100 111 C105 111 110 109 111 102 C112 95 108 82 100 68 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" strokeLinejoin="round" />
              </g>
              <path d="M93 119 H107 L105 134 H95 Z" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            </g>

            <g>
              <g className="mfb-anim mfb-tree-right">
                <line x1="260" y1="106" x2="260" y2="119" stroke="var(--mfb-text)" strokeWidth="2" />
                <path d="M260 68 C252 82 248 95 249 102 C250 109 255 111 260 111 C265 111 270 109 271 102 C272 95 268 82 260 68 Z" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2" strokeLinejoin="round" />
              </g>
              <path d="M253 119 H267 L265 134 H255 Z" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />
            </g>

            <line x1="60" y1="134" x2="300" y2="134" stroke="var(--mfb-ground-muted)" strokeWidth="2" strokeLinecap="round" />
            <rect x="130" y="130" width="100" height="4.8" rx="1.6" fill="var(--mfb-surface-alt)" stroke="var(--mfb-text)" strokeWidth="1.9" strokeLinejoin="round" />

            <g className="mfb-anim mfb-sparkle-a">
              <path d="M147 82 L148.4 86.6 L153 88 L148.4 89.4 L147 94 L145.6 89.4 L141 88 L145.6 86.6 Z" fill="var(--mfb-accent)" />
            </g>
            <g className="mfb-anim mfb-sparkle-b">
              <path d="M213 80 L214.4 84.6 L219 86 L214.4 87.4 L213 92 L211.6 87.4 L207 86 L211.6 84.6 Z" fill="var(--mfb-accent)" />
            </g>
            <g className="mfb-anim mfb-sparkle-c">
              <path d="M180 71 L181.1 74.9 L185 76 L181.1 77.1 L180 81 L178.9 77.1 L175 76 L178.9 74.9 Z" fill="var(--mfb-accent)" />
            </g>

            <g className="mfb-anim mfb-delivered-package">
              <rect x="156" y="96" width="48" height="34" rx="2" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2.1" strokeLinejoin="round" />
              <rect x="153" y="92" width="54" height="8" rx="1.8" fill="var(--mfb-surface)" stroke="var(--mfb-text)" strokeWidth="2.1" strokeLinejoin="round" />
              <rect x="176" y="92" width="8" height="25" fill="var(--mfb-accent)" />
              <path d="M176 92 V117 H184 V92" stroke="var(--mfb-text)" strokeWidth="1.7" strokeLinejoin="round" />
              <g className="mfb-anim mfb-package-tag">
                <line x1="190" y1="98" x2="190" y2="102" stroke="var(--mfb-text)" strokeWidth="1.5" />
                <path d="M187.2 102 L190 99.8 L192.8 102 V110 H187.2 Z" fill="var(--mfb-accent)" stroke="var(--mfb-text)" strokeWidth="1.5" strokeLinejoin="round" />
              </g>
              <rect x="161" y="120" width="8" height="5" rx="1" fill="var(--mfb-accent-soft)" />
            </g>
          </svg>
        )}
      </div>

      <p
        style={{ color: 'var(--mfb-text)' }}
        className="text-base sm:text-lg font-bold tracking-tight"
      >
        {title}
      </p>
      <p
        style={{ color: 'var(--mfb-text-muted)' }}
        className="text-xs sm:text-sm mt-1"
      >
        {subtitle}
      </p>
    </div>
  );
}