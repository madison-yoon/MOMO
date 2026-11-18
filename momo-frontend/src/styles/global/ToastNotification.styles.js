import { createGlobalStyle } from "styled-components";

/* Success and error notices use the same quiet glass material as the app. */
const ToastNotificationStyles = createGlobalStyle`
  .momo-toast {
    --momo-stub-width: 68px;
    position: fixed;
    top: calc(55px + env(safe-area-inset-top, 0px));
    right: 24px;
    z-index: 10000;
    display: flex;
    align-items: stretch;
    width: min(400px, calc(100vw - 48px));
    min-height: 88px;
    box-sizing: border-box;
    padding: 0;
    overflow: hidden;
    color: #303A33;
    font-family: inherit;
    background: linear-gradient(140deg, rgba(255,255,255,.8), rgba(239,246,241,.52) 58%, rgba(222,233,225,.38));
    border: 1px solid rgba(255,255,255,.94);
    border-radius: 17px;
    box-shadow: 0 16px 42px rgba(34,42,37,.14), inset 0 1px rgba(255,255,255,.98);
    -webkit-backdrop-filter: blur(30px) saturate(175%);
    backdrop-filter: blur(30px) saturate(175%);
    transform-origin: top right;
    animation: momo-toast-enter .36s cubic-bezier(.2,.72,.2,1) both;
  }
  .momo-toast.is-leaving {
    animation: momo-toast-leave .24s ease both;
    pointer-events: none;
  }
  .momo-toast-icon {
    position: relative;
    display: grid;
    flex: 0 0 var(--momo-stub-width);
    align-self: stretch;
    width: var(--momo-stub-width);
    place-items: center;
    color: #4F6A56;
    background: linear-gradient(145deg, rgba(255,255,255,.48), rgba(220,235,224,.58));
    border-right: 1px solid rgba(255,255,255,.8);
    font-size: 20px;
    font-weight: 900;
  }
  .momo-toast-icon::after { display: none; }
  .momo-toast-icon span {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    line-height: 1;
    background: linear-gradient(145deg, rgba(255,255,255,.88), rgba(229,241,232,.64));
    border: 1px solid rgba(255,255,255,.96);
    border-radius: 50%;
    box-shadow: 0 3px 9px rgba(34,42,37,.07), inset 0 1px rgba(255,255,255,1);
    animation: momo-toast-check .34s .08s cubic-bezier(.2,.72,.2,1) both;
  }
  .momo-toast-copy {
    display: grid;
    flex: 1;
    min-width: 0;
    align-content: center;
    gap: 6px;
    padding: 17px 21px 19px 18px;
  }
  .momo-toast-logo {
    display: block;
    width: auto;
    max-width: 96px;
    height: 20px;
    object-fit: contain;
    object-position: left center;
  }
  .momo-toast-copy strong {
    justify-self: start;
    overflow-wrap: anywhere;
    padding: 0;
    color: #303A33;
    background: none;
    font-size: 16px;
    font-weight: 850;
    letter-spacing: -.025em;
    line-height: 1.45;
  }
  .momo-toast-copy p {
    margin: 0;
    padding: 0;
    color: #59655D;
    font-size: 12px;
    line-height: 1.55;
  }
  .momo-toast-progress {
    position: absolute;
    right: 0;
    bottom: 0;
    left: var(--momo-stub-width);
    height: 3px;
    overflow: hidden;
    background: rgba(163,185,168,.24);
  }
  .momo-toast-progress span {
    display: block;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, #A7BEAA, #6F8B75);
    transform-origin: left center;
    animation: momo-toast-progress 3.2s linear both;
  }
  @keyframes momo-toast-enter {
    from { opacity: 0; transform: translate3d(14px,-8px,0) scale(.985); }
    to { opacity: 1; transform: translate3d(0,0,0) scale(1); }
  }
  @keyframes momo-toast-leave {
    from { opacity: 1; transform: translate3d(0,0,0); }
    to { opacity: 0; transform: translate3d(12px,-5px,0); }
  }
  @keyframes momo-toast-check {
    from { opacity: 0; transform: scale(.84); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes momo-toast-progress {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }
  @media (max-width: 600px) {
    .momo-toast {
      --momo-stub-width: 58px;
      top: calc(14px + env(safe-area-inset-top, 0px));
      right: 14px;
      left: 14px;
      width: auto;
      min-height: 82px;
    }
    .momo-toast-icon span { width: 32px; height: 32px; font-size: 18px; }
    .momo-toast-copy { padding: 14px 17px 17px 15px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .momo-toast,
    .momo-toast.is-leaving,
    .momo-toast-icon span,
    .momo-toast-progress span {
      animation: none;
      transition: none;
    }
  }
`;

export default ToastNotificationStyles;
